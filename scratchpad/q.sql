.mode list
select 'counts', (select count(*) from bank_txns),(select count(*) from bank_accounts),(select count(*) from bank_customers),(select count(*) from bank_fx);
select 'minmax', min(txn_time), max(txn_time) from bank_txns;
select txn_type, channel, count(*), round(sum(amount),2) from bank_txns group by 1,2;
select 'acct', account_type, currency, status, count(*) from bank_accounts group by 2,3,4;
select 'seg', segment, count(*) from bank_customers group by 2;
select 'hour', cast(substr(txn_time,12,2) as int) h, count(*) from bank_txns group by h;
select 'closed<opened', count(*) from bank_accounts where closed_date < opened_date;
select 'opened capped', count(*) from bank_accounts where opened_date='2024-11-30';
select 'no txn accts', count(*) from bank_accounts a where not exists (select 1 from bank_txns t where t.account_id=a.account_id);
select 'txn after close', count(*) from bank_txns t join bank_accounts a using(account_id) where a.closed_date is not null and substr(t.txn_time,1,10) > a.closed_date;
select 'txn before open', count(*) from bank_txns t join bank_accounts a using(account_id) where substr(t.txn_time,1,10) < a.opened_date;
select 'fraud', count(*), sum(amount) from bank_txns where cast(substr(txn_time,12,2) as int) between 0 and 5;
