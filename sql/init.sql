create database jyhs;
use jyhs;
create table user(
    id int not null auto_increment,
    name varchar(20) not null,
    password varchar(200) not null,
    city varchar(50) not null,
    phone varchar(20) not null,
    type varchar(20) not null default 'consumer',
    status int not null default 0,
    primary key(id)
);
alter table user add column point int not null default 0;
alter table user add column address varchar(200);
alter table user add column description varchar(2000);
alter table user add column province varchar(20);
alter table user add column pay_type varchar(20);
alter table user add column contacts varchar(20);


create table material(
    id int not null auto_increment,
    category varchar(20) not null,
    name varchar(20) not null,
    type varchar(20) not null,
    ename varchar(50),
    sname varchar(50),
    tag varchar(100),
    code varchar(50) not null,
    level varchar(50) not null,
    price int not null,
    description varchar(4000),
    compatibility  varchar(20) not null,
    img_number int,
    primary key(id)
);
alter table material change `name` `name` varchar(100) character set utf8 not null ;
alter table material change `tag` `tag` varchar(100) character set utf8 not null ;
alter table material character set utf8;

create table bill_detail(
    id int not null auto_increment,
    bill_id int not null,
    name varchar(200) not null,
    size varchar(20),
    price int not null,
    point int,
    material_id int,
    primary key(id)
);
alter table bill_detail change `name` `name` varchar(200) character set utf8 not null ;
alter table bill_detail change `size` `size` varchar(20) character set utf8 not null ;
alter table bill_detail add column numbers int;
alter table bill_detail add column limits int;

alter table bill_detail character set utf8;

create table bill(
    id int not null auto_increment,
    name varchar(100) not null,
    contacts varchar(20) not null,
    phone varchar(20) not null,
    description varchar(4000),
    upload_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id int not null,
    primary key(id)
);
alter table bill change `name` `name` varchar(100) character set utf8 not null ;
alter table bill change `contacts` `contacts` varchar(20) character set utf8 not null ;
alter table bill change `description` `description` varchar(4000) character set utf8 not null ;
alter table bill add column effort_date TIMESTAMP;
alter table bill add column supplier_id int not null;
alter table bill add column is_one_step int  default 0;



create table group_bill(
    id int not null auto_increment,
    name varchar(100) not null,
    contacts varchar(100) not null,
    phone varchar(20) not null,
    end_date  TIMESTAMP  not null,
    pickup_address varchar(200) not null,
    pay_type varchar(10) not null,
    pay_count varchar(50) not null,
    pay_name varchar(50) not null,
    freight double(3,2) not null,
    pay_description varchar(500),
    description varchar(4000) not null,
    isflash  int,
    flash_desc varchar(500),
    bill_id int not null,
    user_id int not null,
    primary key(id)
);
alter table group_bill add column pickup_date TIMESTAMP;
alter table group_bill add column status int not null DEFAULT 1;
alter table group_bill add column city varchar(10);
alter table group_bill add column province varchar(20);

alter table group_bill change `name` `name` varchar(100) character set utf8 not null ;
alter table group_bill change `contacts` `contacts` varchar(100) character set utf8 not null ;
alter table group_bill change `pickup_address` `pickup_address` varchar(200) character set utf8 not null ;
alter table group_bill change `pay_name` `pay_name` varchar(50) character set utf8 not null ;
alter table group_bill change `pay_description` `pay_description` varchar(500) character set utf8 not null ;
alter table group_bill change `description` `description` varchar(4000) character set utf8 not null ;
alter table group_bill change `flash_desc` `flash_desc` varchar(500) character set utf8 not null ;
alter table group_bill character set utf8;

alter table group_bill change `pickup_address` `pickup_address` varchar(200) character set utf8 ;
alter table group_bill change `pay_type` `pay_type` varchar(10) character set utf8 ;
alter table group_bill change `pay_count` `pay_count` varchar(50) character set utf8 ;
alter table group_bill change `pay_name` `pay_name` varchar(50) character set utf8 ;
alter table group_bill change `pay_description` `pay_description` varchar(500) character set utf8 ;
alter table group_bill change `flash_desc` `flash_desc` varchar(500) character set utf8 ;
alter table group_bill change `pickup_date` `pickup_date` TIMESTAMP;
alter table group_bill change `freight` `freight` double(3,2);
alter table group_bill add column private int  default 0;


create table cart(
    id int not null auto_increment,
    group_bill_id int not null,
    insert_date  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    user_id int not null,
    primary key(id)
);
alter table cart add column phone varchar(11);
alter table cart add column description varchar(2000);
alter table cart add column status int not null default 0;
alter table cart add column sum int not null default 0;

alter table cart change `phone` `phone` varchar(11) character set utf8 not null ;
alter table cart change `description` `description` varchar(2000) character set utf8;


create table cart_detail(
    id int not null auto_increment,
    cart_id int not null,
    bill_detail_id int not null,
    bill_detail_num int not null DEFAULT 1,
    primary key(id)
);


create table citys(
 mark varchar(15) not null,
 name varchar(60) not null,
 area varchar(30) not null,
 fristLetter varchar(5),
 sort int(11),
 qq   varchar(100),
 type int(11),
 primary key(mark)
);