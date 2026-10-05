'use client'

import { ViewerControlsBar } from './viewer/viewer-controls-bar'
import { ViewerSceneHeader } from './viewer/viewer-scene-header'

type ProjectOwner = {
  id: string
  name: string
  username: string | null
  image: string | null
}

interface ViewerOverlayProps {
  projectName?: string | null
  owner?: ProjectOwner | null
  canShowScans?: boolean
  canShowGuides?: boolean
  onBack?: () => void
}

export const ViewerOverlay = ({
  projectName,
  owner,
  canShowScans = true,
  canShowGuides = true,
  onBack,
}: ViewerOverlayProps) => (
  <>
    <ViewerSceneHeader onBack={onBack} owner={owner} projectName={projectName} />
    <ViewerControlsBar
      canShowGuides={canShowGuides}
      canShowScans={canShowScans}
    />
  </>
)
