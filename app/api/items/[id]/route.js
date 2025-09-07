import dbConnect from "@/lib/mongoose";
import Item from "@/models/Item";

/**
 * GET /api/items/[id] - Get a single item by ID
 */
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const item = await Item.findById(id).lean();
    if (!item) {
      return new Response(JSON.stringify({ message: "Item not found" }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ item }), { status: 200 });
  } catch (err) {
    console.error("GET /api/items/[id] error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}

/**
 * PUT /api/items/[id] - Update an item
 * Body: { title, description, price, category, imageUrl }
 */
export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await req.json();
    
    const item = await Item.findById(id);
    if (!item) {
      return new Response(JSON.stringify({ message: "Item not found" }), { status: 404 });
    }
    
    // Update fields if provided
    if (body.title) item.title = body.title;
    if (body.description !== undefined) item.description = body.description;
    if (body.price) item.price = parseFloat(body.price);
    if (body.category !== undefined) item.category = body.category;
    if (body.imageUrl !== undefined) item.imageUrl = body.imageUrl;
    
    await item.save();
    
    return new Response(JSON.stringify({ message: "Item updated", item }), { status: 200 });
  } catch (err) {
    console.error("PUT /api/items/[id] error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}

/**
 * DELETE /api/items/[id] - Delete an item
 */
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    const result = await Item.findByIdAndDelete(id);
    if (!result) {
      return new Response(JSON.stringify({ message: "Item not found" }), { status: 404 });
    }
    
    return new Response(JSON.stringify({ message: "Item deleted" }), { status: 200 });
  } catch (err) {
    console.error("DELETE /api/items/[id] error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}