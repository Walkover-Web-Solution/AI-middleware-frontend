"use client"
import Protected from '@/components/protected'
import RAGEmbedContent from '@/components/ragEmbed/RAGEmbedContent'
import React from 'react'
import PageHeader from '@/components/Pageheader'
import MainLayout from '@/components/layoutComponents/MainLayout'
import { use } from 'react'

const page = ({ params }) => {
  const resolvedParams = use(params)

  return (
    <div className="container mx-auto px-4 py-6">
      <MainLayout>
        <PageHeader
          title=" RAG Embed Integration"
          docLink="https://app.docstar.io/p/features/rag-embed--1?collectionId=inYU67SKiHgW"
          description="Embedded RAG allows you to seamlessly integrate the full RAG AI interface directly into any product or website."
        />
      </MainLayout>
      <RAGEmbedContent params={resolvedParams} />
    </div>
  )
}

export default Protected(page)
