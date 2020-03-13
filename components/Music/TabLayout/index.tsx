import React, { FunctionComponent, ReactElement } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'

import styles from './styles.less'

export interface TabElement {
  title: string
  element: ReactElement
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
            key={`tab-${tab.title}`}
          >
            {tab.title}
          </Tab>
        ))}
      </TabList>
      <div className={styles.tabPanelContainer}>
        {tabs.map(tab => (
          <TabPanel className={styles.tabPanel} key={`panel-${tab.title}`}>
            {tab.element}
          </TabPanel>
        ))}
      </div>
    </Tabs>
  )
}

export default TabLayout
