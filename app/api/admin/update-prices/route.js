import dbConnect from "@/lib/mongoose";
import Item from "@/models/Item";

export async function POST(req) {
  try {
    await dbConnect();
    
    // Define realistic pricing for products
    const priceUpdates = [
      { title: 'Blue T-Shirt', newPrice: 1299 },
      { title: 'Wireless Mouse', newPrice: 2499 },
      { title: 'Water Bottle', newPrice: 899 },
      { title: 'Bluetooth Headphones', newPrice: 8499 },
      { title: 'Wireless Earbuds', newPrice: 5999 },
      { title: 'Running Shoes', newPrice: 6999 },
      { title: 'Sport Sneakers', newPrice: 4999 }
    ];

    const results = [];
    
    for (const update of priceUpdates) {
      const result = await Item.updateOne(
        { title: update.title }, 
        { $set: { price: update.newPrice } }
      );
      
      results.push({
        title: update.title,
        newPrice: update.newPrice,
        modified: result.modifiedCount > 0,
        found: result.matchedCount > 0
      });
    }

    return new Response(JSON.stringify({ 
      message: "Price update complete", 
      results 
    }), { status: 200 });
    
  } catch (err) {
    console.error("Price update error:", err);
    return new Response(JSON.stringify({ message: "Server error" }), { status: 500 });
  }
}
