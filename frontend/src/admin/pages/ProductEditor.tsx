import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FiArrowLeft, FiArrowRight, FiUploadCloud, FiX } from 'react-icons/fi';
import { apiErrorMessage, apiFieldErrors } from '../../lib/api';
import { thumbOf } from '../../lib/images';
import { getMeta } from '../../services/storeService';
import { adminApi, type ProductInput } from '../adminApi';
import type { Meta, Product } from '../../types';

interface Form {
  name: string;
  brand: string;
  category: string;
  silhouette: string;
  price: string;
  originalPrice: string;
  sizes: number[];
  colors: string[];
  images: string[];
  description: string;
  popularity: string;
  active: boolean;
  trending: boolean;
  isNewArrival: boolean;
}

const fromProduct = (p: Product | null): Form => ({
  name: p?.name ?? '',
  brand: p?.brand ?? '',
  category: p?.category ?? 'Sneakers',
  silhouette: p?.silhouette ?? 'low',
  price: p ? String(p.price) : '',
  originalPrice: p ? String(p.originalPrice) : '',
  sizes: p?.sizes ?? [40, 41, 42, 43, 44],
  colors: p?.colors ?? [],
  images: p?.images ?? [],
  description: p?.description ?? '',
  popularity: p ? String(p.popularity ?? 0) : '50',
  active: p ? p.active !== false : true,
  trending: p?.trending ?? false,
  isNewArrival: p?.isNewArrival ?? true,
});

/**
 * Add / edit a product in a side sheet. Photos upload straight to Cloudinary (drag in or
 * pick several); the first photo is the main one, arrows reorder them.
 */
export function ProductEditor({
  product,
  onClose,
  onSaved,
}: {
  product: Product | null;
  onClose: () => void;
  onSaved: (product: Product) => void;
}) {
  const [form, setForm] = useState<Form>(() => fromProduct(product));
  const [meta, setMeta] = useState<Meta | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getMeta()
      .then(setMeta)
      .catch(() => setError('Could not load the brand and size lists'));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) =>
    setForm((f) => ({ ...f, [key]: value }));
  const toggleIn = <T,>(list: T[], value: T) =>
    list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

  const upload = async (files: FileList | File[]) => {
    const images = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!images.length) return;
    setUploading((n) => n + images.length);
    for (const file of images) {
      try {
        if (file.size > 8 * 1024 * 1024) throw new Error(`${file.name} is over 8 MB`);
        const url = await adminApi.uploadImage(file);
        setForm((f) => ({ ...f, images: [...f.images, url] }));
      } catch (err) {
        setError(
          err instanceof Error && !('isAxiosError' in err)
            ? err.message
            : apiErrorMessage(err, 'Upload failed'),
        );
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const move = (index: number, by: -1 | 1) => {
    const images = [...form.images];
    const target = index + by;
    if (target < 0 || target >= images.length) return;
    [images[index], images[target]] = [images[target], images[index]];
    set('images', images);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const input: ProductInput = {
      name: form.name,
      brand: form.brand,
      category: form.category,
      silhouette: form.silhouette as Product['silhouette'],
      price: Number(form.price),
      originalPrice: Number(form.originalPrice || form.price),
      sizes: form.sizes,
      colors: form.colors,
      images: form.images,
      description: form.description,
      popularity: Number(form.popularity || 0),
      active: form.active,
      trending: form.trending,
      isNewArrival: form.isNewArrival,
    };
    try {
      const saved = product
        ? await adminApi.updateProduct(product._id, input)
        : await adminApi.createProduct(input);
      onSaved(saved);
    } catch (err) {
      setErrors(apiFieldErrors(err));
      setError(apiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const err = (key: string) => errors[key] && <em>{errors[key]}</em>;

  return (
    <div
      className="a-sheet-wrap"
      role="presentation"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <form
        className="a-sheet"
        onSubmit={submit}
        role="dialog"
        aria-modal="true"
        aria-label={product ? 'Edit product' : 'Add product'}
      >
        <header className="a-sheet-head">
          <h2>{product ? 'Edit product' : 'Add product'}</h2>
          <button type="button" className="a-icon" onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </header>

        <div className="a-sheet-body">
          <section>
            <h3>Photos</h3>
            <div
              className={`a-drop ${dragOver ? 'over' : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                void upload(e.dataTransfer.files);
              }}
            >
              <FiUploadCloud aria-hidden="true" />
              <p>
                Drag photos here or{' '}
                <button type="button" className="a-link" onClick={() => fileInput.current?.click()}>
                  choose files
                </button>
              </p>
              <small>
                JPG, PNG or WebP up to 8 MB. Stored on Cloudinary. The first photo is the main one.
              </small>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  if (e.target.files) void upload(e.target.files);
                  e.target.value = '';
                }}
              />
            </div>
            {(form.images.length > 0 || uploading > 0) && (
              <ul className="a-photos">
                {form.images.map((src, i) => (
                  <li key={src}>
                    <img src={thumbOf(src)} alt={`Photo ${i + 1}`} />
                    {i === 0 && <span className="a-main">Main</span>}
                    <div className="a-photo-tools">
                      <button
                        type="button"
                        onClick={() => move(i, -1)}
                        aria-label="Move left"
                        disabled={i === 0}
                      >
                        <FiArrowLeft />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          set(
                            'images',
                            form.images.filter((s) => s !== src),
                          )
                        }
                        aria-label="Remove photo"
                      >
                        <FiX />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, 1)}
                        aria-label="Move right"
                        disabled={i === form.images.length - 1}
                      >
                        <FiArrowRight />
                      </button>
                    </div>
                  </li>
                ))}
                {Array.from({ length: uploading }, (_, i) => (
                  <li key={`up-${i}`} className="a-uploading">
                    <div className="spinner sm" />
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="a-fields">
            <label className="a-field a-wide">
              <span>Name</span>
              <input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder='Nike Dunk Low "Panda"'
                required
              />
              {err('name')}
              {err('slug')}
            </label>
            <label className="a-field">
              <span>Brand</span>
              <select value={form.brand} onChange={(e) => set('brand', e.target.value)} required>
                <option value="">Choose…</option>
                {meta?.brands.map((b) => (
                  <option key={b}>{b}</option>
                ))}
              </select>
              {err('brand')}
            </label>
            <label className="a-field">
              <span>Category</span>
              <select value={form.category} onChange={(e) => set('category', e.target.value)}>
                {meta?.categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              {err('category')}
            </label>
            <label className="a-field">
              <span>Price (৳)</span>
              <input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                required
              />
              {err('price')}
            </label>
            <label className="a-field">
              <span>Old price (৳, for the sale badge)</span>
              <input
                type="number"
                min={0}
                value={form.originalPrice}
                onChange={(e) => set('originalPrice', e.target.value)}
                placeholder="Same as price"
              />
              {err('originalPrice')}
            </label>
            <label className="a-field">
              <span>Shape (for the drawn placeholder)</span>
              <select value={form.silhouette} onChange={(e) => set('silhouette', e.target.value)}>
                <option value="low">Low</option>
                <option value="high">High</option>
                <option value="runner">Runner</option>
              </select>
            </label>
            <label className="a-field">
              <span>Popularity (higher shows first)</span>
              <input
                type="number"
                min={0}
                value={form.popularity}
                onChange={(e) => set('popularity', e.target.value)}
              />
            </label>
          </section>

          <section>
            <h3>Sizes in stock (EU)</h3>
            <div className="a-chips">
              {meta?.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  aria-pressed={form.sizes.includes(size)}
                  onClick={() =>
                    set(
                      'sizes',
                      toggleIn(form.sizes, size).sort((a, b) => a - b),
                    )
                  }
                >
                  {size}
                </button>
              ))}
            </div>
            {err('sizes')}
          </section>

          <section>
            <h3>Colours (for the colour filter)</h3>
            <div className="a-chips">
              {meta?.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  aria-pressed={form.colors.includes(c.name)}
                  onClick={() => set('colors', toggleIn(form.colors, c.name))}
                >
                  <i style={{ background: c.hex }} /> {c.name}
                </button>
              ))}
            </div>
          </section>

          <section>
            <label className="a-field a-wide">
              <span>Description</span>
              <textarea
                rows={3}
                maxLength={600}
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </label>
          </section>

          <section className="a-flags">
            <label>
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => set('active', e.target.checked)}
              />{' '}
              Show in the store
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.trending}
                onChange={(e) => set('trending', e.target.checked)}
              />{' '}
              Trending
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.isNewArrival}
                onChange={(e) => set('isNewArrival', e.target.checked)}
              />{' '}
              New badge
            </label>
          </section>
        </div>

        <footer className="a-sheet-foot">
          {error && <p className="a-error">{error}</p>}
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving || uploading > 0}>
            {saving ? 'Saving…' : product ? 'Save changes' : 'Add product'}
          </button>
        </footer>
      </form>
    </div>
  );
}
