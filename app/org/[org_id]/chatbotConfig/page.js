'use client'
import FormSection from '@/components/chatbotConfiguration/formSection'
import MainLayout from '@/components/layoutComponents/MainLayout'
import PageHeader from '@/components/Pageheader'
import Protected from '@/components/protected'
import React from 'react'

const Page = ({ params }) => {
  return (
    <div className="h-auto">
      <MainLayout>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between w-full px-2 pt-4">
          <PageHeader
            title="Chatbot Configuration"
            description="Customize your chatbot's appearance, behavior, and agent switching capabilities."
            docLink="https://blog.gtwy.ai/features/-embed-chatbot?source=single"
          />
        </div>
        
        <div className="px-2">
          <FormSection params={params} />
        </div>
      </MainLayout>
    </div>
  )
}

export default Protected(Page)