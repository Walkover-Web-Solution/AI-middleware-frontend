"use client"
import Protected from '@/components/protected'
import RAGEmbedContent from '@/components/ragEmbed/RAGEmbedContent'
import React from 'react'
import PageHeader from '@/components/Pageheader'
import MainLayout from '@/components/layoutComponents/MainLayout'
import { use } from 'react'
import { useCustomSelector } from '@/customHooks/customSelector'

const page = ({ params }) => {
  const resolvedParams = use(params)
const {descriptions} = useCustomSelector((state)=>{
  return {
    descriptions: state.flowDataReducer.flowData?.descriptionsData?.descriptions || {},
  }
})
  return (
    <div className="container mx-auto px-4 py-6">
      <MainLayout>
        <PageHeader
          title=" RAG Embed Integration"
          docLink="https://gtwy.ai/blogs/features/rag-as-embed"
          description={descriptions?.['RAG Embed'] || "Embedded RAG allows you to seamlessly integrate the full RAG AI interface directly into any product or website."}
        />
      </MainLayout>
      <RAGEmbedContent params={resolvedParams} />
    </div>
  )
}

export default Protected(page)
