import { Suspense } from "react"
import { SubmissionReview } from "@/components/submission-review"

function SubmissionReviewWrapper() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Submission Review</h1>
      <Suspense fallback={<div>Loading submission review...</div>}>
        <SubmissionReview />
      </Suspense>
    </div>
  )
}

export default function SubmissionReviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SubmissionReviewWrapper />
    </Suspense>
  )
} 