# House-0.1说明

1、HouseInfo包含了房东发布房源信息的基本要素，受限于EVM字节限制，所有将HouseInfo拆分为两部分，一部分为房源的基本信息，另外一部分为房源发布相关信息，以房源id为索引。

## House-0.2 说明

1、合约能够正常发布，缺少评论和合同相关的功能

## House-0.3 说明

1、增加评论和合同相关功能模块

2、微调租房流程

## House-0.4 说明

1、合并Token合约与HouseInfo合约

2、调整房源信息中不合理的字段

## House-0.5 说明

1、调整房东发布房源流程：房东先向合约转入保证金Token，然后才能发布房源。（HouseInfo合约具有管理Token的功能，但是实例化的token使用transfer函数必须是HouseInfo合约中的token转到用户的地址）
