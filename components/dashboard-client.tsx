"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DataChart } from "@/components/data-chart"
import { Spinner } from "@/components/ui/spinner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

type DataPoint = {
  t: number
  kg: number
}

type GraphData = {
  id: string
  started_at: string
  samples: DataPoint[]
}

export function DashboardClient() {
  const [graphs, setGraphs] = useState<GraphData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      setError("missing_credentials")
      setLoading(false)
      return
    }

    const supabase = createBrowserClient(supabaseUrl, supabaseKey)

    async function fetchData() {
      try {
        const { data, error } = await supabase
          .from("weight_events")
          .select("*")
          .order("started_at", { ascending: false })

        console.log("[v0] Fetched data:", data)

        if (error) throw error

        setGraphs(data || [])
      } catch (err) {
        console.error("[v0] Error fetching data:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner className="h-8 w-8" />
          <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error === "missing_credentials") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Alert className="max-w-2xl">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Supabase Configuration Required</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>To connect to your Supabase database, you need to add the following environment variables:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>
                <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project
                URL
              </li>
              <li>
                <code className="rounded bg-muted px-1 py-0.5">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Your Supabase
                anonymous key
              </li>
            </ul>
            <p className="mt-3 text-sm">
              You can find these values in your Supabase project settings at{" "}
              <a
                href="https://supabase.com/dashboard/project/_/settings/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Settings → API
              </a>
            </p>
            <p className="mt-3 text-sm font-medium">
              Add these environment variables in the Project Settings (gear icon in the top right).
            </p>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error Loading Data</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="font-sans text-3xl font-bold tracking-tight">AutoScale Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Visualizing time-series weight data with {graphs.length} dataset{graphs.length !== 1 ? "s" : ""}
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {graphs.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Data Available</CardTitle>
              <CardDescription>
                No graph data found in your Supabase table. Add some data to get started.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {graphs.map((graph) => (
              <DataChart
                key={graph.id}
                title={new Date(graph.started_at).toLocaleString()}
                data={graph.samples}
                createdAt={graph.started_at}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
