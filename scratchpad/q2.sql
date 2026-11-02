select a.currency, count(*), sum(amount) from bank_txns t join bank_accounts a using(account_id) where txn_type='faiz' group by 1;
select t.*, a.account_type, a.status, a.closed_date, a.credit_limit from bank_txns t join bank_accounts a using(account_id) where cast(substr(txn_time,12,2) as int) < 6 order by txn_time;
select substr(txn_time,1,10) d, count(*) from bank_txns t join bank_accounts a using(account_id) where a.currency<>'TRY' and not exists (select 1 from bank_fx f where f.rate_date=substr(t.txn_time,1,10) and f.currency=a.currency) group by d;
select 'weekend txns', count(*) from bank_txns where strftime('%w', substr(txn_time,1,10)) in ('0','6');
select 'sum', sum(amount), count(distinct account_id) from bank_txns;
select 'dup', count(*) from (select account_id, txn_time, amount, count(*) n from bank_txns group by 1,2,3 having n>1);
select 'cust w/o accts txn', count(*) from bank_customers c where not exists (select 1 from bank_accounts a join bank_txns t using(account_id) where a.customer_id=c.customer_id);
select 'mcat null on kart', count(*) from bank_txns where txn_type='kart_harcama' and merchant_category is null;
select 'mcat', merchant_category, count(*) from bank_txns group by 2;
