drop database blockchain;
create database blockchain;
use blockchain

-- user 
drop table user;
create table user(
  username char(20) not null,
  passwd char(255) not null,
  primary key(username)
) charset=utf8;

insert into user 
  (username, passwd) 
  values
  ('bank', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'),
  ('companyA', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'),
  ('companyB', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92'),
  ('factory', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92');
  

-- public key
drop table publicKey;
create table publicKey(
  username char(20) not null,
  publicKey char(160) not null
) charset=utf8;


-- private key
drop table pri_keys;
create table pri_keys(
  pub char(160) not null,
  pri text(500) not null,
  primary key(pub)
) charset=utf8;

insert into pri_keys
  (pub, pri)
  values
  ('0x07a1227f2d5eab54d0dcd9c6897aa3bf2e970955', '-----BEGIN PRIVATE KEY-----\nMIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQg6Frsk4sBmJyuHljvn36e\nUOC+VdMZhxcepgIFBFmK4yyhRANCAATeWMRkCQir1WyQx2YlNmveMO0iTBMrVNaJ\n+c9dB3zhiHej69XjGMFx9NEkO2NP2xWWJSiiV7VkwIVRlf/x3ty7\n-----END PRIVATE KEY-----'),
  ('0x7b5d75c825301ee4a10c86f4f7fb96ec16e3c5be', '-----BEGIN PRIVATE KEY-----\nMIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQgLDVgk5aG40N0uY6ie/cV\n71aAgJ0A7nFSR5JOZcLeIQuhRANCAAQb+lv3v+ozVVNdis1frJhgHfkVtkru7tcg\nLIqLn6owLxzyEWW1ZzubnlG4uD3Z/x9tLUynFFNSRgX3niGLQzwK\n-----END PRIVATE KEY-----'),
  ('0x16f09cc32b772077acfa78b9e4abfec6b4aedc26', '-----BEGIN PRIVATE KEY-----\nMIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQgsshGV3j5Bgl8TxrEEvAg\nJnY7Kw8gc1jg/WQk7RUFz1mhRANCAATwEsgxGILrMNBMozlfRaSpgHowO+WSiyyC\nqbQwRcCCW9mzcwTPJe+zUlaBciLlLYW+iO5WtwGalTTqgYmrzYB6\n-----END PRIVATE KEY-----'),
  ('0x144d5ca47de35194b019b6f11a56028b964585c9', '-----BEGIN PRIVATE KEY-----\nMIGEAgEAMBAGByqGSM49AgEGBSuBBAAKBG0wawIBAQQg7xwPgk3T6+TZRE+NjY52\nL8OKlsVgDpEb8kwhrrdIQyehRANCAARznr/pSK3UzHm9D11wOmnZegZ+Zx4ykpKt\nY/9CkJgEi+wtZUMHWa/7L+zoKbvo8OzzJi8Z/KWjVbERFpylM/xH\n-----END PRIVATE KEY-----');

  