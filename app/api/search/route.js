import dbConnect from "@/lib/mongoose";
import Item from "@/models/Item";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const city = searchParams.get('city');
    const minPrice = parseFloat(searchParams.get('minPrice') || searchParams.get('price_min'));
    const maxPrice = parseFloat(searchParams.get('maxPrice') || searchParams.get('price_max'));
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = 10;

    const query = {};
    if (q) {
      query.$or = [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
      ];
    }
    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }
    if (!isNaN(minPrice) || !isNaN(maxPrice)) {
      query.price = {};
      if (!isNaN(minPrice)) query.price.$gte = minPrice;
      if (!isNaN(maxPrice)) query.price.$lte = maxPrice;
    }

    // Fetch and populate vendor for optional city filter
    const skip = (page - 1) * limit;
    const [allMatching, totalMatching] = await Promise.all([
      Item.find(query).populate('vendorId').lean(),
      Item.countDocuments(query)
    ]);

    // Filter by city using vendor.location if provided
    const filtered = city
      ? allMatching.filter(it => (it.vendorId?.location || '').toLowerCase().includes(String(city).toLowerCase()))
      : allMatching;

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const items = filtered.slice(skip, skip + limit);

    return new Response(JSON.stringify({ items, page, totalPages, total }), { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('GET /api/search error:', err);
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}



