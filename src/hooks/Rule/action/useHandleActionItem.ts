import {
  getActionDetail,
  postAction,
  putAction,
  putActionEnable,
  deleteAction as requestDelAction,
} from '@/api/action'
import {
  createBridge,
  deleteBridge,
  getBridgeInfo,
  startStopBridge,
  updateBridge,
} from '@/api/ruleengine'
import { getTypeAndNameFromKey } from '@/common/tools'
import { isConnectorSupported } from '@/hooks/Rule/bridge/useBridgeTypeValue'
import { Action, BridgeItem } from '@/types/rule'
import { useActionDataHandler, useBridgeDataHandler } from '../useDataHandler'

type NowAction = Action | BridgeItem

export default (): {
  getDetail: <T = NowAction>(id: string) => Promise<T>
  addAction: <T = NowAction>(data: T) => Promise<T>
  updateAction: <T = NowAction>(data: T) => Promise<T>
  deleteAction: (id: string) => Promise<void>
  getMetrics: (id: string) => Promise<any>
  toggleActionEnable: (id: string, isEnable: boolean) => Promise<void>
} => {
  const isTrueActionId = (id: string) => isConnectorSupported(getTypeAndNameFromKey(id).type)

  const getDetail = async <T = NowAction>(id: string): Promise<T> => {
    const func = isTrueActionId(id) ? getActionDetail : getBridgeInfo
    return func(id) as Promise<T>
  }

  const { handleBridgeDataBeforeSubmit } = useBridgeDataHandler()
  const { handleActionDataBeforeUpdate } = useActionDataHandler()

  const addAction = async <T = NowAction>(data: T): Promise<T> => {
    const request = isConnectorSupported((data as NowAction).type) ? postAction : createBridge
    return request(data as any) as Promise<T>
  }

  const updateAction = async <T = NowAction>(data: T): Promise<T> => {
    try {
      const { id, type } = data as NowAction

      const isTrueAction = isConnectorSupported(type)
      const func = isTrueAction ? putAction : updateBridge
      const dataHandler = isTrueAction ? handleActionDataBeforeUpdate : handleBridgeDataBeforeSubmit

      Reflect.deleteProperty(data as NowAction, 'id')
      const dataToSubmit = await dataHandler(data)

      return func(id, dataToSubmit as any) as Promise<T>
    } catch (error) {
      console.error(error)
      return Promise.reject(error)
    }
  }

  const deleteAction = async (id: string): Promise<void> => {
    const func = isTrueActionId(id) ? requestDelAction : deleteBridge
    return func(id)
  }

  // TODO: type of ret; request action metrics
  const getMetrics = async (id: string): Promise<any> => {
    const func = isTrueActionId(id) ? requestDelAction : deleteBridge
    return func(id)
  }

  const toggleActionEnable = (id: string, isEnable: boolean) => {
    const func = isTrueActionId(id) ? putActionEnable : startStopBridge
    return func(id, isEnable)
  }

  return {
    getDetail,
    addAction,
    updateAction,
    deleteAction,
    getMetrics,
    toggleActionEnable,
  }
}