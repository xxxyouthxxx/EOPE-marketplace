# hope of pixel数据库文档

## 数据库内表：

1. MEMBER表：包含会员信息的表，包括会员ID、密码、电子邮箱、姓名、昵称、手机号码、头像URL、出生日期和注册时间等字段。
2. NFT表：包含NFT（非同质化代币）交易信息的表，包括NFT的哈希值、持有人ID、创建者ID、类型、名称和价格等字段。
3. EXHIBITION表：包含展览信息的表，包括展览ID、会员ID、展览类型和展览评论等字段。
4. EXHIBITION_WORK表：包含展览作品信息的表，包括展览ID、NFT哈希值和作品评论等字段。
5. profile_image表：用于存储用户上传的头像图片文件信息，具体包括图片的文件名、大小、MIME 类型、尺寸以及上传时间等信息。
6. market表： 用于存储 NFT 实例在市场上的交易信息，包括拍卖的起始时间和结束时间、卖方和买方的地址、NFT 实例的价格等等。这些信息有助于追踪和验证市场中的交易活动。
7. file_list表：用于存储 NFT 实例的附加文件（例如图片等），以及 NFT 实例在区块链上的存储位置等相关信息。文件可以通过文件名、文件大小、文件类型等信息进行检索和访问。

---

# MEMBER表：

- MEMBER_SEQ：bigint 类型，自增主键。用于标识每个成员的唯一ID。
- MEMBER_ID：varchar 类型，非空，唯一索引。用于成员的登录名和在系统内唯一的ID。
- MEMBER_PASSWORD：varchar 类型，非空。用于成员的登录密码。
- MEMBER_ADDRESS：varchar 类型，可选。用于存储成员的地址信息。
- PROFILE_IMAGE_URL：varchar 类型，默认 "upload/noimage.png"，可选。用于存储成员的头像图片的路径。
- AUTHORITY：tinyint 类型，默认值为 0，可选。用于记录成员的权限级别，例如管理员的权限级别可能是1，普通成员的权限级别可能是0。
- MEMBER_BIO：varchar 类型，长度为 1024，可选。用于记录成员的简介信息。
- SSF：bigint 类型，可选。用于存储成员的积分或财产等数据。（保留）
- REG_DT：timestamp 类型，可选。用于记录成员的注册时间。

---

# NFT表

- `NFT_SEQ`: 自增的 ID 值，作为记录的唯一标识。
- `NFT_AUTHOR_SEQ`: NFT 作者在另一个表格中的 ID。
- `NFT_AUTHOR_NAME`: NFT 作者的名字。
- `NFT_OWNER_SEQ`: NFT 所有者在另一个表格中的 ID。
- `NFT_OWNER_ADDRESS`: NFT 所有者的以太坊地址。
- `NFT_WORK_URI`: NFT 的作品 URI。
- `NFT_METADATA_URI`: NFT 的元数据 URI。
- `NFT_NAME`: NFT 的名称。
- `NFT_TYPE`: NFT 的类型。
- `NFT_DESCRIPTION`: NFT 的描述。
- `NFT_CONTRACT_ADDRESS`: NFT 所在的合约地址。
- `NFT_TOKEN_ID`: NFT 的智能合约 token ID。
- `reg_dt`: 创建记录的日期和时间。
- `FILE_URL`: 包含 NFT 图像或视频文件的 URL。
- `NFT_ONSALE`: 以布尔 (tinyint) 类型表示 NFT 是否在出售状态，0 表示不在出售状态，1 表示在出售状态。

----

# EXHIBITION表

- `EXHIBITION_ID`: 自增 ID，作为每个展览的唯一标识。

- `MEMBER_SEQ`: 外键，关联到另一个表格中的 ID，作为展览的创建者所对应的 ID。

- `EXHIBITION_TITLE`: 展览的标题。

- `EXHIBITION_TYPE`: 展览的类型。

- `EXHIBITION_DESCRIPTION`: 展览描述。

- `reg_dt`: 创建展览的日期和时间。

  

---

# EXHIBITION_WORK表

- `WORK_ID`: 自增 ID，作为每个展品的唯一标识。
- `EXHIBITION_ID`: 展览 ID，外键，关联到 "exhibition" 表格中的 ID 字段，表示该展品属于哪个展览。
- `NFT_SEQ`: NFT ID，外键，关联到 "nft" 表格中的 NFT_SEQ 字段，表示该展品所对应的 NFT。

---

# profile_image表

- PROFILE_IMAGE_ID: 图片的唯一标识符，自增长的bigint类型。
- MEMBER_SEQ: 用户的唯一标识符，bigint类型，默认为null。
- PROFILE_IMAGE_NAME: 图片的名称，varchar类型，最大长度255字符。
- PROFILE_IMAGE_SIZE: 图片的大小，bigint类型。
- PROFILE_IMAGE_URL: 图片的URL地址，varchar类型，最大长度255字符，默认值为'upload/noimage.png'。
- REG_DT: 注册时间，timestamp类型，可为空。

---

# market表

- MARKET_ID：自增长的唯一标识符，bigint 类型。
- NFT_SEQ：一个 NFT 实例的唯一标识符，bigint 类型，非空。
- MARKET_CONTRACT_ADDRESS：市场合约的地址，varchar 类型，最大长度为255字符，非空。
- SELLER：卖方的地址，varchar 类型，最大长度为255字符，非空。
- BUYER：买方的地址，varchar 类型，最大长度为255字符，默认为 'n'。
- PRICE：该 NFT 实例的售价，bigint 类型，非空。
- START_TIME：拍卖开始时间，datetime 类型，可为空。
- END_TIME：拍卖结束时间，datetime 类型，可为空。
- REG_DT：该行记录的创建时间，timestamp 类型，可为空。
- ENDED：拍卖是否结束的标志，tinyint 类型，如果已结束则为1，否则为0，默认为0。
- CANCELED：拍卖是否取消的标志，tinyint 类型，如果已取消则为1，否则为0，默认为0。

---

# file_list表

- file_id：自增长的唯一标识符，bigint 类型。
- file_content_type：文件的 MIME 类型，varchar 类型，最大长度为255字符，默认为空。
- file_name：文件名，varchar 类型，最大长度为255字符，默认为空。
- file_size：文件大小，bigint 类型，默认为空。
- file_url：文件的 URL 地址，varchar 类型，最大长度为255字符，默认为空。
- nft_seq：一个 NFT 实例的唯一标识符，bigint 类型，默认为空。
- reg_dt：该行记录的创建时间，datetime 类型，可为空。