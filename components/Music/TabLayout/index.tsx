import React, { FunctionComponent, ReactElement } from 'react'
import { Tab as ReactTab, Tabs, TabList, TabPanel } from 'react-tabs'

export interface TabElement {
  title: string
  element: ReactElement
}

type TabLayoutProps = {
  tabs: TabElement[]
}

const TabLayout: FunctionComponent<TabLayoutProps> = ({ tabs }) => (
  <Tabs>
    <TabList>
      {tabs.map(tab => (
        <ReactTab>{tab.title}</ReactTab>
      ))}
    </TabList>
    {tabs.map(tab => (
      <TabPanel>{tab.element}</TabPanel>
    ))}
  </Tabs>
)

export default TabLayout
