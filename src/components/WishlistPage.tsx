import { Trash2, ShoppingCart } from "lucide-react";
import { useInventory } from "../hooks/useInventory";
import { products } from "../data/products";
import { ui } from "../data/i18n";

export default function WishlistPage() {
  const { data, removeFromWishlist, toggleProductOwned } = useInventory();

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">{ui.myWishlist}</h2>
      {data.wishlist.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{ui.wishlistEmpty}</p>
        </div>
      ) : (
        <div className="border rounded-xl overflow-hidden bg-white">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="table-header">{ui.product}</th>
                <th className="table-header">{ui.priority}</th>
                <th className="table-header">{ui.notes}</th>
                <th className="table-header">{ui.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.wishlist.map((item) => {
                const product = products.find((p) => p.id === item.productId);
                if (!product) return null;
                return (
                  <tr key={item.productId}>
                    <td className="table-cell font-medium">{product.code} - {product.nameEn}</td>
                    <td className="table-cell">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                        item.priority === "High" ? "bg-red-100 text-red-700" : 
                        item.priority === "Medium" ? "bg-yellow-100 text-yellow-700" : 
                        "bg-green-100 text-green-700"
                      }`}>
                        {item.priority === "High" ? ui.high : 
                         item.priority === "Medium" ? ui.medium : 
                         ui.low}
                      </span>
                    </td>
                    <td className="table-cell text-gray-500 text-sm max-w-xs">{item.notes || "-"}</td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            toggleProductOwned(product.id);
                            removeFromWishlist(product.id);
                          }}
                          className="btn btn-success text-xs"
                        >{ui.ownIt}</button>
                        <button
                          onClick={() => removeFromWishlist(product.id)}
                          className="btn btn-secondary text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
