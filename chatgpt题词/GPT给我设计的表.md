我的毕业设计是模仿r/place做一个共享像素画布，所有玩家只能在同一个有限的画布上放置像素块，我会指定画布活动的主题，玩家们按照活动的主题自由创作配合，用户放置的像素可以在自己的个人信息内直观的看见。同时我写了一个商城页面，用于展览一定时间内的用户的画作功能，像素块信息表有x,y,颜色，用户id，时间戳。画布会以一个月为周期，每个月都有一个画布主题，称之为画作系列，结束时我会将画布的数据保存并清空，画布上的画会被存档，切分成多个图片并保存到图床上，同一个系列的图片拥有同一个系列名，现在我需要你帮我按照我的要求设计数据库：

---

# GPT给我设计的表

1. 用户信息表格：

   | 字段名     | 数据类型 | 说明         |
   | ---------- | -------- | ------------ |
   | user_id    | int      | 用户ID，主键 |
   | username   | varchar  | 用户名       |
   | password   | varchar  | 密码         |
   | email      | varchar  | 邮箱         |
   | avatar     | varchar  | 头像链接     |
   | createtime | datetime | 创建时间     |
   | bio        | varchar  | 用户简介     |

   画布的像素块信息表格：

   | 字段名    | 数据类型 | 说明           |
   | --------- | -------- | -------------- |
   | pixel_id  | int      | 像素块ID，主键 |
   | pos_x     | int      | 像素块X坐标    |
   | pos_y     | int      | 像素块Y坐标    |
   | color     | varchar  | 像素块颜色     |
   | user_id   | int      | 用户ID，外键   |
   | timestamp | datetime | 时间戳         |

   画作系列图片存档表格：

   | 字段名       | 数据类型 | 说明         |
   | :----------- | -------- | ------------ |
   | archive_id   | int      | 存档ID，主键 |
   | archive_name | varchar  | 存档名称     |
   | archive_url  | varchar  | 存档链接     |
   | theme_name   | int      | 主题名       |
   | archive_time | datetime | 存档时间     |
   | image_bio    | varchar  | 画作简介     |