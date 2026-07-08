import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, setDoc, updateDoc, deleteDoc, doc, onSnapshot, collectionGroup } from 'firebase/firestore';
import { Plus, Edit, Trash2, Search, X, UploadCloud } from 'lucide-react';


const CLOUDINARY_UPLOAD_PRESET = 'SistemaGestion'; 
const CLOUDINARY_API_URL = `https://api.cloudinary.com/v1_1/dtf8s8epz/image/upload`;
// ------------------------------------

const InventoryManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', salePrice: '', stock: '', category: '', image: '' });
  const [hasVariants, setHasVariants] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      const categoriesSnapshot = await getDocs(collection(db, 'categories'));
      setCategories(categoriesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchCategories();

    const unsubscribe = onSnapshot(collectionGroup(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', salePrice: '', stock: '', category: '', image: '' });
    setEditingProduct(null);
    setImageFile(null);
    setImagePreview('');
    setHasVariants(false);
    setIsUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUploading(true);
    let imageUrl = formData.image;

    try {
      // 1. Subir imagen a Cloudinary si hay un archivo nuevo
      if (imageFile) {
        const data = new FormData();
        data.append('file', imageFile);
        data.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

        const res = await fetch(CLOUDINARY_API_URL, {
          method: 'POST',
          body: data,
        });
        const file = await res.json();
        if (file.secure_url) {
          imageUrl = file.secure_url;
        } else {
          throw new Error('Error al subir la imagen a Cloudinary');
        }
      }

      // 2. Guardar datos del producto en Firestore (con la URL de Cloudinary)
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : null,
        stock: hasVariants ? Object.fromEntries(Object.entries(formData.stock).map(([key, value]) => [key, parseInt(value || 0, 10)])) : parseInt(formData.stock || 0, 10),
        category: formData.category,
        image: imageUrl,
      };

      if (productData.salePrice === null || isNaN(productData.salePrice) || productData.salePrice <= 0) {
        // Firestore no guarda campos nulos, pero para estar seguros, lo eliminamos.
        delete productData.salePrice;
      }

      if (editingProduct) {
        const productRef = doc(db, 'categories', editingProduct.category, 'products', editingProduct.id);
        await updateDoc(productRef, { ...productData, image: imageUrl });
      } else {
        const categorySlug = productData.category;
        if (!categorySlug) {
          alert("Por favor, selecciona una categoría.");
          setIsUploading(false);
          return;
        }
        const newProductRef = doc(collection(db, 'categories', categorySlug, 'products'));
        await setDoc(newProductRef, {
          ...productData, image: imageUrl, id: newProductRef.id
        });
      }
      
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Error al guardar el producto: " + error.message);
      setIsUploading(false);
    }
  };

  const handleDelete = async (product) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      const productRef = doc(db, 'categories', product.category, 'products', product.id);
      await deleteDoc(productRef);
    }
  };

  const getTotalStock = (stock) => {
    if (typeof stock === 'object' && stock !== null) {
        return Object.values(stock).reduce((sum, count) => sum + (parseInt(count, 10) || 0), 0);
    }
    return stock;
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const openEditModal = (product) => {
    setEditingProduct(product);
    const isVariant = typeof product.stock === 'object' && product.stock !== null;
    setHasVariants(isVariant);
    setFormData({ ...product, stock: product.stock, salePrice: product.salePrice || '' });
    setImagePreview(product.image || '');
    setShowModal(true);
  };

  const openNewModal = () => {
    resetForm();
    setHasVariants(false);
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-800">Inventario</h2>
        <button 
          onClick={openNewModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" /> Nuevo Producto
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Buscar productos..." 
          className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Oferta</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {product.image && <img src={product.image} alt={product.name} className="h-10 w-10 rounded-full object-cover mr-3" />}
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${product.price.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">
                  {product.salePrice ? `$${product.salePrice.toFixed(2)}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${product.stock > 10 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {getTotalStock(product.stock)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => openEditModal(product)} className="text-blue-600 hover:text-blue-900 mr-4"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(product)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => { setShowModal(false); resetForm(); }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input type="text" required className="mt-1 w-full border rounded-md p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio</label>
                  <input type="number" step="0.01" required className="mt-1 w-full border rounded-md p-2" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio de Oferta</label>
                  <input type="number" step="0.01" className="mt-1 w-full border rounded-md p-2" value={formData.salePrice} onChange={e => setFormData({ ...formData, salePrice: e.target.value })} placeholder="Opcional" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select 
                  required 
                  className="mt-1 w-full border rounded-md p-2 bg-white" 
                  value={formData.category} 
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  id="has-variants" 
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  checked={hasVariants}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setHasVariants(checked);
                    setFormData({...formData, stock: checked ? { '': '' } : ''});
                  }}
                />
                <label htmlFor="has-variants" className="ml-2 block text-sm text-gray-900">Este producto tiene variantes (ej. color, tamaño)</label>
              </div>

              {hasVariants ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock por Variante</label>
                  <div className="space-y-2 mt-1">
                    {Object.entries(typeof formData.stock === 'object' && formData.stock !== null ? formData.stock : { '': '' }).map(([variant, count], index) => (
                      <div key={index} className="flex gap-2">
                        <input type="text" placeholder="Nombre Variante (ej. Rojo)" value={variant} onChange={(e) => { const newStock = { ...formData.stock }; delete newStock[variant]; newStock[e.target.value] = count; setFormData({ ...formData, stock: newStock }); }} className="w-full border rounded-md p-2" />
                        <input type="number" placeholder="Stock" value={count} onChange={(e) => setFormData({ ...formData, stock: { ...formData.stock, [variant]: e.target.value } })} className="w-1/3 border rounded-md p-2" />
                      </div>
                    ))}
                    <button type="button" onClick={() => setFormData({ ...formData, stock: { ...formData.stock, '': '' } })} className="text-sm text-blue-600 hover:underline">Añadir variante</button>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input type="number" required className="mt-1 w-full border rounded-md p-2" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">Imagen del Producto</label>
                <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Previsualización" className="mx-auto h-24 w-auto rounded-md object-cover" />
                    ) : (
                      <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                    )}
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Sube un archivo</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                      </label>
                      <p className="pl-1">o arrástralo aquí</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
                  </div>
                </div>
              </div>
              <button type="submit" disabled={isUploading} className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed">
                {isUploading ? 'Guardando...' : 'Guardar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;
