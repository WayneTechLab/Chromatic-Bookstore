import { addDoc, collection, doc, serverTimestamp, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { db, storage } from '@/config/firebase'
import { isStripeTestMode, stripePromise, stripePublishableKey } from '@/config/stripe'

export type ProductPublishInput = {
  title: string
  author: string
  price: number
  category: string
  license: string
  status: 'Draft' | 'Review' | 'Live'
  pdfFile?: File | null
}

export type StripeDemoActionInput = {
  customerEmail?: string
  customerId?: string
  productId?: string
  priceId?: string
  mode?: 'payment' | 'subscription'
}

function demoId(prefix: string) {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replace(/-/g, '').slice(0, 18)
    : `${Date.now()}${Math.random().toString(16).slice(2, 10)}`

  return `${prefix}_${random}`
}

function appendDemoRecord(key: string, record: Record<string, unknown>) {
  if (typeof localStorage === 'undefined') return

  const raw = localStorage.getItem(key)
  const records = raw ? JSON.parse(raw) as Record<string, unknown>[] : []
  localStorage.setItem(key, JSON.stringify([{ ...record, createdAt: new Date().toISOString() }, ...records].slice(0, 25)))
}

export async function publishProduct(input: ProductPublishInput) {
  if (!db) {
    const productId = demoId('prod_demo')
    appendDemoRecord('chromatic.demo.products', {
      id: productId,
      title: input.title,
      author: input.author,
      price: input.price,
      category: input.category,
      license: input.license,
      status: input.status,
      pdfFileName: input.pdfFile?.name ?? '',
      storageMode: 'local-demo',
    })

    return {
      id: productId,
      pdfPath: input.pdfFile ? `demo/products/${productId}/${input.pdfFile.name}` : '',
      downloadUrl: '',
    }
  }

  const productRef = doc(collection(db, 'products'))
  let pdfPath = ''
  let downloadUrl = ''

  if (input.pdfFile && storage) {
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
  } else if (input.pdfFile) {
    pdfPath = `demo/products/${productRef.id}/source/${input.pdfFile.name}`
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
  const stripe = await stripePromise
  const stripeStatus = stripe
    ? 'stripe-js-ready'
    : stripePublishableKey
      ? 'stripe-js-unavailable'
      : 'missing-publishable-key'

  if (!db) {
    const checkoutId = demoId('cs_test_demo')
    appendDemoRecord('chromatic.demo.checkoutIntents', {
      id: checkoutId,
      productId,
      provider: 'stripe',
      mode: 'test',
      status: 'created',
      stripeStatus,
    })

    return checkoutId
  }

  const checkoutRef = await addDoc(collection(db, 'checkoutIntents'), {
    productId,
    provider: 'stripe',
    mode: 'test',
    status: 'created',
    stripeStatus,
    publishableKeyMode: isStripeTestMode ? 'test' : 'not-configured',
    createdAt: serverTimestamp(),
  })

  return checkoutRef.id
}

export async function createStripeCheckoutSessionDraft(input: StripeDemoActionInput) {
  const stripe = await stripePromise
  const session = {
    id: demoId(input.mode === 'subscription' ? 'cs_sub_test_demo' : 'cs_test_demo'),
    object: 'checkout.session',
    mode: input.mode ?? 'payment',
    status: 'open',
    customer_email: input.customerEmail ?? 'customer@example.test',
    customer: input.customerId ?? demoId('cus_demo'),
    productId: input.productId ?? '',
    priceId: input.priceId ?? '',
    provider: 'stripe',
    environment: 'test',
    stripeJs: stripe ? 'ready' : 'publishable-key-needed',
  }

  appendDemoRecord('chromatic.demo.checkoutSessions', session)
  return session
}

export async function createBillingPortalSessionDraft(input: StripeDemoActionInput) {
  const stripe = await stripePromise
  const portal = {
    id: demoId('bps_test_demo'),
    object: 'billing_portal.session',
    status: 'created',
    customer: input.customerId ?? demoId('cus_demo'),
    customer_email: input.customerEmail ?? 'customer@example.test',
    return_url: typeof location !== 'undefined' ? `${location.origin}/admin-billing` : '/admin-billing',
    provider: 'stripe',
    environment: 'test',
    stripeJs: stripe ? 'ready' : 'publishable-key-needed',
  }

  appendDemoRecord('chromatic.demo.billingPortalSessions', portal)
  return portal
}
