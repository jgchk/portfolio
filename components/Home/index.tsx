import React, { FunctionComponent, useRef } from 'react'
import Icon from 'react-fontawesome'
import classNames from 'classnames'

import useMousePosition from '../../hooks/useMousePosition'
import transform from './transform'
import data from './data'
import css from './styles.less'

const Home: FunctionComponent<{}> = () => {
  const { x, y } = useMousePosition()

  const menuEl = useRef(null)
  const menuTransform = transform(x, y, menuEl)

  return (
    <div className={css.wrapper}>
      <div className={css.menu} ref={menuEl} style={menuTransform}>
        {data.map(item => {
          const key = `${item.type} ${item.text}`

          const children = [
            <div key={`text ${key}`} className={css.text}>
              {item.text}
            </div>,
          ]
          if (['title', 'blurb'].includes(item.type))
            children.push(
              <div key={`shadow ${key}`} className={css.shadow}>
                {item.text}
              </div>
            )
          if ('icon' in item)
            children.push(
              <Icon
                key={`icon ${key}`}
                className={classNames(css.icon, css[item.icon])}
                name={item.icon}
              />
            )

          return (
            <div key={key} className={css[item.type]}>
              {'url' in item && <a href={item.url}>{children}</a>}
              {!('url' in item) && <span>{children}</span>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Home
