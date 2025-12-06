import dbConnect from "@/lib/mongoose";
import Review from "@/models/Review";

export async function GET(req) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    if (!productId) return new Response(JSON.stringify({ message: 'productId required' }), { status: 400 });
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 }).lean();
    return new Response(JSON.stringify({ reviews }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const { productId, name, rating, comment, vendorId } = body;
    if (!productId || !name || !rating) {
      return new Response(JSON.stringify({ message: 'productId, name, rating required' }), { status: 400 });
    }
    const review = await Review.create({ productId, name, rating: Number(rating), comment: comment || '', vendorId });
    return new Response(JSON.stringify({ review }), { status: 201 });
  } catch (e) {
    return new Response(JSON.stringify({ message: 'Server error' }), { status: 500 });
  }
}



