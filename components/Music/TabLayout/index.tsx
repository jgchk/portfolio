import React, { FunctionComponent, ReactNode } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import styles from './styles.less'

export interface TabElement {
  id: string
  tab: ReactNode
  panel: ReactNode
}

type TabLayoutProps = {
  tabs: TabElement[]
}

const TabLayout: FunctionComponent<TabLayoutProps> = ({ tabs }) => {
  return (
    <Tabs className={styles.tabs}>
      <TabList className={styles.tabList}>
        {tabs.map(tab => (
          <Tab
            className={styles.tab}
            selectedClassName={styles.selected}
            key={`tab-${tab.id}`}
          >
            {tab.tab}
          </Tab>
        ))}
      </TabList>
      {tabs.map(tab => (
        <div className={styles.tabPanelContainer}>
          <TabPanel className={styles.tabPanel} key={`panel-${tab.id}`}>
            {tab.panel}
          </TabPanel>
        </div>
      ))}
    </Tabs>
  )
}

export default TabLayout
