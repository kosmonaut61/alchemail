"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, Mail, Edit3 } from "lucide-react"
import { Toaster } from "@/components/ui/toaster"
import { PreambleEditor } from "@/components/preamble-editor"
import { EmailWizard } from "@/components/email-wizard"

export default function EmailGenerator() {
  const [showWizard, setShowWizard] = useState(false)
  const [showPreambleEditor, setShowPreambleEditor] = useState(false)


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Email Campaign Generator</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Create personalized email sequences powered by AI. Our guided 4-step process helps you craft compelling outreach campaigns with intelligent context selection.
          </p>
        </div>

        {/* Main CTA Card */}
        <Card className="shadow-xl max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Ready to Generate Your Email Campaign?</CardTitle>
            <CardDescription className="text-lg">
              Follow our intuitive 4-step process to create targeted email sequences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Process Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <h3 className="font-semibold text-blue-900">Campaign Signal</h3>
                  <p className="text-sm text-blue-700">Describe your email campaign context and target audience</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <h3 className="font-semibold text-green-900">Context Review</h3>
                  <p className="text-sm text-green-700">Review and customize AI-suggested context items</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-purple-50 rounded-lg">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <h3 className="font-semibold text-purple-900">Prompt Review</h3>
                  <p className="text-sm text-purple-700">Review the final ChatGPT prompt before generation</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <div>
                  <h3 className="font-semibold text-orange-900">Output & Edit</h3>
                  <p className="text-sm text-orange-700">View results and request edits based on feedback</p>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <Button 
                onClick={() => setShowWizard(true)} 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                <Mail className="h-5 w-5 mr-2" />
                Start Email Campaign Generator
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900">AI-Powered Context</h4>
                <p className="text-sm text-gray-600">Intelligent context selection based on your signal</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Full Transparency</h4>
                <p className="text-sm text-gray-600">Preview exactly what gets sent to ChatGPT</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Edit3 className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900">Iterative Editing</h4>
                <p className="text-sm text-gray-600">Request changes and refine your campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowPreambleEditor(true)}
            className="text-gray-600"
          >
            <Settings className="h-4 w-4 mr-2" />
            Advanced Settings
          </Button>
        </div>
      </div>

      {/* Wizard Modal */}
      {showWizard && (
        <EmailWizard onClose={() => setShowWizard(false)} />
      )}

      {/* Preamble Editor */}
      {showPreambleEditor && (
        <PreambleEditor onClose={() => setShowPreambleEditor(false)} />
      )}

      <Toaster />
    </div>
  )
}
