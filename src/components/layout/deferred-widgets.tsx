"use client"

import dynamic from "next/dynamic"

type DeferredWidgetsProps = {
  user: unknown
}

const Chatbot = dynamic(() => import("@/components/chat/Chatbot"), {
  ssr: false,
})

const OnboardingPopupHandler = dynamic(
  () => import("@/components/onboarding-popup-handler").then((module) => module.OnboardingPopupHandler),
  { ssr: false },
)

export default function DeferredWidgets({ user }: DeferredWidgetsProps) {
  return (
    <>
      <OnboardingPopupHandler />
      <Chatbot user={user} />
    </>
  )
}
