| 表名       | 字段             | 类型       | 是否主键 | 是否外键 | 描述         |
|------------|------------------|------------|----------|----------|--------------|
| user_info  | user_id          | int        | 主键    |          | 用户ID       |
|            | username         | varchar    |          |          | 用户名        |
|            | password         | varchar    |          |          | 密码          |
|            | email            | varchar    |          |          | 邮箱          |
|            | avatar           | varchar    |          |          | 头像链接      |
|            | createtime       | datetime   |          |          | 创建时间      |
|            | bio              | varchar    |          |          | 用户简介      |
| canvas_theme | theme_id         | int        | 主键    |          | 主题ID       |
|             | theme_name       | varchar    |          |          | 主题名称      |
|             | start_time       | datetime   |          |          | 开始时间      |
|             | end_time         | datetime   |          |          | 结束时间      |
|             | description      | varchar    |          |          | 主题描述      |
| pixel_block | pixel_id         | int        | 主键    |          | 像素块ID     |
|             | pos_x            | int        |          |          | 像素块X坐标  |
|             | pos_y            | int        |          |          | 像素块Y坐标  |
|             | color            | varchar    |          |          | 像素块颜色    |
|             | user_id          | int        |          | 外键    | 用户ID       |
|             | timestamp        | datetime   |          |          | 时间戳        |
| image_archive | archive_id      | int        | 主键    |          | 存档ID       |
|               | archive_name    | varchar    |          |          | 存档名称     |
|               | archive_url     | varchar    |          |          | 存档链接     |
|               | theme_id        | int        |          | 外键    | 主题ID       |
|               | archive_time    | datetime   |          |          | 存档时间      |
|               | image_bio       | varchar    |          |          | 画作简介      |