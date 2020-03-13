import React, { FunctionComponent, ReactElement, useRef } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import useScrollPosition from '../../../hooks/useScrollPosition'
import useDimensions from '../../../hooks/useDimensions'
import styles from './styles.less'

export interface ExtraProps {
  dimensions: { width: number; height: number }
  scrollPosition: { x: number; y: number }
}

export interface TabElement {
  title: string
  element: (props: ExtraProps) => ReactElement
}

type TabLayoutProps = {
  tabs: TabElement[]
}

const TabLayout: FunctionComponent<TabLayoutProps> = ({ tabs }) => {
  const ref = useRef<HTMLDivElement>(null)
  const { width, height } = useDimensions(ref, false)
  const { x, y } = useScrollPosition(ref, false)
  return (
    <Tabs className={styles.tabs}>
      <TabList className={styles.tabList}>
        {tabs.map(tab => (
          <Tab
            className={styles.tab}
            selectedClassName={styles.selected}
            key={`tab-${tab.title}`}
          >
            {tab.title}
          </Tab>
        ))}
      </TabList>
      <div className={styles.tabPanelContainer} ref={ref}>
        {tabs.map(tab => (
          <TabPanel className={styles.tabPanel} key={`panel-${tab.title}`}>
            {tab.element({
              dimensions: { width, height },
              scrollPosition: { x, y },
            })}
          </TabPanel>
        ))}
      </div>
    </Tabs>
  )
}

export default TabLayout
