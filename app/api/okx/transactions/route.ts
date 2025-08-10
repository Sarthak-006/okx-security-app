import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const OKX_BASE_URL = "https://www.okx.com"
const PROJECT_ID = process.env.OKX_PROJECT_ID
const API_KEY = process.env.OKX_API_KEY
const SECRET_KEY = process.env.OKX_SECRET_KEY
const PASSPHRASE = process.env.OKX_API_PASSPHRASE

function createSignature(timestamp: string, method: string, requestPath: string, body = "") {
  const message = timestamp + method + requestPath + body
  return crypto.createHmac("sha256", SECRET_KEY!).update(message).digest("base64")
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const address = searchParams.get("address")
  const chainId = searchParams.get("chainId")
  const limit = searchParams.get("limit") || "20"

  if (!address || !chainId) {
    return NextResponse.json({ error: "Address and chainId are required" }, { status: 400 })
  }

  if (!PROJECT_ID || !API_KEY || !SECRET_KEY || !PASSPHRASE) {
    return NextResponse.json({ error: "OKX API credentials not configured" }, { status: 500 })
  }

  try {
    const timestamp = new Date().toISOString()
    const method = "GET"
    const requestPath = `/api/v5/dex/aggregator/account/tx-history?address=${address}&chainId=${chainId}&limit=${limit}`
    const signature = createSignature(timestamp, method, requestPath)

    const headers = {
      "OK-ACCESS-KEY": API_KEY,
      "OK-ACCESS-SIGN": signature,
      "OK-ACCESS-TIMESTAMP": timestamp,
      "OK-ACCESS-PASSPHRASE": PASSPHRASE,
      "OK-ACCESS-PROJECT": PROJECT_ID,
      "Content-Type": "application/json",
    }

    const response = await fetch(`${OKX_BASE_URL}${requestPath}`, {
      method: "GET",
      headers,
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions from OKX API" }, { status: 500 })
  }
}
