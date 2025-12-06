# Cart System - Testing Guide

## What Was Fixed

### Root Cause Analysis
After analyzing the entire codebase, I found:

1. **ID Mismatch**: Cart page was using `cartLineIdOf()` which extracted wrong IDs
2. **API Inconsistency**: Frontend sent `itemId` but backend compared against different field structures
3. **No Single Source of Truth**: Each operation fetched IDs differently

### The Complete Fix

**Backend (app/api/cart/route.js):**
- Simple, straightforward logic
- Uses `findIndex` with `.toString()` comparison to find items
- Add: checks if exists → increment qty, else push new
- Update: finds item → updates qty or removes if 0
- Delete: finds and splices from array

**Frontend (app/cart/page.js):**
- Uses `item.id` consistently everywhere
- Passes correct `itemId` to all API calls
- Refreshes entire cart from server after mutations (no optimistic updates)
- Clean loading states

## Testing Steps

### Step 1: Clean Database
```bash
node scripts/clear-all-carts.js
```

### Step 2: Test Add to Cart
1. Login to your account
2. Go to `/items`
3. Click "Add to Cart" on "Wireless Mouse"
4. **Expected**: Button changes to "✓ In Cart"
5. Click "Add to Cart" again on same mouse
6. **Expected**: Message "Added to cart" appears
7. Go to `/cart`
8. **Expected**: See ONE line with "Wireless Mouse", quantity = 2

### Step 3: Test Quantity Update
1. In cart, click "+" button on Mouse
2. **Expected**: Quantity becomes 3, loading spinner shows briefly
3. Click "-" button twice
4. **Expected**: Quantity becomes 1

### Step 4: Test Delete
1. Click the trash icon on Mouse
2. **Expected**: Row disappears, cart shows "Your cart is empty"
3. Refresh the page
4. **Expected**: Cart is still empty (no phantom items)

### Step 5: Test Multiple Items
1. Go to `/items`
2. Add "Mouse" → check cart (1 item)
3. Go back, add "T-Shirt" → check cart (2 items)
4. Go back, add "Mouse" again → check cart (still 2 items, Mouse qty = 2)
5. **Expected**: No duplicate rows, quantities increment correctly

### Step 6: Test Not Logged In
1. Logout
2. Go to `/cart`
3. **Expected**: Immediately redirects to `/login`
4. Try to add item from `/items` while logged out
5. **Expected**: Shows "Please login to add to cart"

## What Should Work Now

✅ Adding same item increases quantity (no duplicates)
✅ Deleting items removes them completely
✅ No 404 errors on delete
✅ No "Item not in cart" errors
✅ Cart only works when logged in
✅ Quantity updates are instant and persistent
✅ Refresh preserves cart state

## If Issues Persist

Check browser console for errors:
- Look for failed API calls
- Check what `itemId` is being sent
- Verify MongoDB has clean cart data

Check MongoDB directly:
```javascript
db.users.find({}, { email: 1, cart: 1 })
```

Should see:
```json
{
  "email": "your@email.com",
  "cart": [
    {
      "item": "ObjectId(...)",
      "quantity": 2,
      "priceSnapshot": 25.99
    }
  ]
}
```

