"use client"
import Protected from '@/components/protected'
import RAGEmbedContent from '@/components/ragEmbed/RAGEmbedContent'
import React from 'react'
import { useParams } from 'next/navigation'
import PageHeader from '@/components/Pageheader'
import MainLayout from '@/components/layoutComponents/MainLayout'

const page = () => {
  const params = useParams()

  return (
    <div className="container mx-auto px-4 py-6">
      <MainLayout>
        <PageHeader
          title=" RAG Embed Integration"
          docLink="https://app.docstar.io/p/features/rag-embed--1?collectionId=inYU67SKiHgW"
          description="RAG as a Service. Embed a knowledge base into your own system and let your AI deliver context-aware, accurate answers using your data.
"
        />
      </MainLayout>
      <RAGEmbedContent params={params} />
    </div>
  )
}

export default Protected(page)
