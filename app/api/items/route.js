import dbConnect from "@/lib/mongoose";
import Item from "@/models/Item";

/**
 * GET /api/items - Get all items with optional filtering
 */
export async function GET(req) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search') || searchParams.get('q'); // Handle both 'search' and 'q' parameters
    const priceMin = searchParams.get('price_min');
    const priceMax = searchParams.get('price_max');
    
    let query = {};
    
    // Add category filter if provided
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Add search filter if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add price filters if provided
    if (priceMin || priceMax) {
      query.price = {};
      if (priceMin) query.price.$gte = parseFloat(priceMin);
      if (priceMax) query.price.$lte = parseFloat(priceMax);
    }
    
    const items = await Item.find(query).lean();
    
    return new Response(JSON.stringify({ items }), { status: 200 });
  } catch (err) {
    console.error("GET /api/items error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}

/**
 * POST /api/items - Create a new item
 * Body: { title, description, price, category, imageUrl, stock }
 */
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    
    const { title, description, price, category, imageUrl, stock = 100 } = body;
    
    if (!title || !price) {
      return new Response(JSON.stringify({ message: "Title and price are required" }), { status: 400 });
    }
    
    const item = await Item.create({
      title,
      description: description || "",
      price: parseFloat(price),
      category: category || "general",
      imageUrl: imageUrl || "",
      stock: parseInt(stock) || 100
    });
    
    return new Response(JSON.stringify({ message: "Item created", item }), { status: 201 });
  } catch (err) {
    console.error("POST /api/items error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
