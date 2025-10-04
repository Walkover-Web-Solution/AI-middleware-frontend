'use client'
import FormSection from '@/components/chatbotConfiguration/formSection'
import MainLayout from '@/components/layoutComponents/MainLayout'
import PageHeader from '@/components/Pageheader'
import Protected from '@/components/protected'
import { useCustomSelector } from '@/customHooks/customSelector'
import React, { use } from 'react'

const Page = ({ params }) => {
  const resolvedParams = use(params);
  const { descriptions } = useCustomSelector((state) => ({
    descriptions: state.flowDataReducer.flowData?.descriptionsData?.descriptions || {},
  }));
  return (
    <div className="h-auto">
      <MainLayout>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full px-2 pt-4">
          <PageHeader
            title="Chatbot Configuration"
            description={descriptions?.['Chatbot Setup'] || "Customize your chatbot's appearance, behavior, and agent switching capabilities."}
            docLink="https://gtwy.ai/blogs/features/-embed-chatbot"
          />
        </div>
        
        <div className="px-2">
          <FormSection params={resolvedParams} />
        </div>
      </MainLayout>
    </div>
  )
}

export default Protected(Page)