import { getLevelElevations, type LevelNode, sceneRegistry, useScene } from '@aedifex/core'
import { useFrame } from '@react-three/fiber'
import { lerp } from 'three/src/math/MathUtils.js'
import useViewer from '../../store/use-viewer'

export const LevelSystem = () => {
  useFrame((_, delta) => {
    const nodes = useScene.getState().nodes
    const levelMode = useViewer.getState().levelMode

    const levelElevations = getLevelElevations(nodes)
    type LevelEntry = {
      levelId: string
      index: number
      obj: NonNullable<ReturnType<typeof sceneRegistry.nodes.get>>
    }
    const entries: LevelEntry[] = []
    sceneRegistry.byType.level!.forEach((levelId) => {
      const obj = sceneRegistry.nodes.get(levelId)
      const level = nodes[levelId as LevelNode['id']] as LevelNode | undefined
      if (obj && level) {
        entries.push({
          levelId,
          index: level.level,
          obj,
        })
      }
    })

    for (const { levelId, obj } of entries) {
      const baseY = levelElevations.get(levelId)?.baseY ?? 0
      const targetY = baseY

      obj.position.y = lerp(obj.position.y, targetY, delta * 12)
      obj.visible = true
    }
  }, 5) // Using a lower priority so it runs after transforms from other systems have settled
  return null
}
