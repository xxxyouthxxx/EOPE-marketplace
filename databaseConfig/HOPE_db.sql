CREATE TABLE `user_info` (
  `user_id` int NOT NULL PRIMARY KEY,
  `username` varchar(30) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(100) DEFAULT NULL,
  `avatar` varchar(500) DEFAULT NULL,
  `createtime` datetime DEFAULT NULL,
  `bio` varchar(1024) DEFAULT NULL
);

CREATE TABLE `canvas_theme` (
  `theme_id` int NOT NULL PRIMARY KEY,
  `theme_name` varchar(255) NOT NULL,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL
);

CREATE TABLE `pixel_block` (
  `pixel_id` int NOT NULL PRIMARY KEY,
  `pos_x` int DEFAULT NULL,
  `pos_y` int DEFAULT NULL,
  `color` varchar(50) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `timestamp` datetime DEFAULT NULL,
  FOREIGN KEY (`user_id`) REFERENCES user_info (`user_id`)
);

CREATE TABLE `image_archive` (
  `archive_id` int NOT NULL PRIMARY KEY,
  `archive_name` varchar(255) NOT NULL,
  `archive_url` varchar(255) DEFAULT NULL,
  `theme_id` int DEFAULT NULL,
  `archive_time` datetime DEFAULT NULL,
  `image_bio` varchar(255) DEFAULT NULL,
  FOREIGN KEY (`theme_id`) REFERENCES canvas_theme (`theme_id`)
);
