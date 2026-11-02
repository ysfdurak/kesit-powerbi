select sum(n>=80), sum(n between 40 and 79), sum(n<40) from (select account_id, count(*) n from bank_txns group by 1);
select a.account_type, count(*), avg(n) from (select account_id, count(*) n from bank_txns group by 1) x join bank_accounts a using(account_id) group by 1;
select count(*) from bank_accounts where account_type='kredi_karti' and credit_limit is null;
select count(*) from bank_accounts where account_type<>'kredi_karti' and credit_limit is not null;
