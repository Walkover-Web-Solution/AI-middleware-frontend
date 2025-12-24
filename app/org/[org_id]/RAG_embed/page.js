"use client"
import Protected from '@/components/Protected'
import RAGEmbedContent from '@/components/ragEmbed/RAGEmbedContent'
import React, { use } from 'react'
import PageHeader from '@/components/Pageheader'
import MainLayout from '@/components/layoutComponents/MainLayout'
import { useCustomSelector } from '@/customHooks/customSelector'

const page = ({ params }) => {
  const resolvedParams = use(params)
const {descriptions , linksData} = useCustomSelector((state)=>{
  return {
    descriptions: state.flowDataReducer.flowData?.descriptionsData?.descriptions || {},
    linksData: state.flowDataReducer.flowData.linksData || [],
  }
})
  return (
    <div className="container mx-auto px-4 py-6">
      <MainLayout>
        <PageHeader
          title=" RAG Embed Integration"
          docLink={linksData?.find(link => link.title === 'RAG as Embed')?.blog_link}
          description={descriptions?.['RAG Embed'] || "Embedded RAG allows you to seamlessly integrate the full RAG AI interface directly into any product or website."}
        />
      </MainLayout>
      <RAGEmbedContent params={resolvedParams} />
    </div>
  )
}

export default Protected(page)
