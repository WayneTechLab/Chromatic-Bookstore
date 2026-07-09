import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '@/config/firebase'

export type ProductPublishInput = {
  title: string
  author: string
  price: number
  category: string
  license: string
  status: 'Draft' | 'Review' | 'Live'
  pdfFile?: File | null
}

export async function publishProduct(input: ProductPublishInput) {
  if (!db || !storage) {
    throw new Error('Firebase is not configured.')
  }

  const productRef = doc(collection(db, 'products'))
  let pdfPath = ''
  let downloadUrl = ''

  if (input.pdfFile) {
    pdfPath = `products/${productRef.id}/source/${input.pdfFile.name}`
    const pdfRef = ref(storage, pdfPath)
    await uploadBytes(pdfRef, input.pdfFile, {
      contentType: input.pdfFile.type || 'application/pdf',
      customMetadata: {
        productId: productRef.id,
        license: input.license,
      },
    })
    downloadUrl = await getDownloadURL(pdfRef)
  }

  await setDoc(productRef, {
    title: input.title,
    author: input.author,
    price: input.price,
    category: input.category,
    license: input.license,
    status: input.status,
    visibility: input.status === 'Live' ? 'public' : 'private',
    pdfPath,
    downloadUrl,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  await addDoc(collection(db, 'adminAuditLogs'), {
    action: 'product.publish',
    productId: productRef.id,
    title: input.title,
    createdAt: serverTimestamp(),
  })

  return { id: productRef.id, pdfPath, downloadUrl }
}

export async function createCheckoutIntent(productId: string) {
  if (!db) {
    throw new Error('Firebase is not configured.')
  }

  const checkoutRef = await addDoc(collection(db, 'checkoutIntents'), {
    productId,
    provider: 'stripe',
    mode: 'test',
    status: 'created',
    createdAt: serverTimestamp(),
  })

  return checkoutRef.id
}

