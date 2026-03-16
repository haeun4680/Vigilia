-- Vigilia 습관 트래커 DB 스키마
-- Supabase > SQL Editor 에서 실행하세요

-- 1. 습관 테이블
create table if not exists habits (
  id          uuid    default gen_random_uuid() primary key,
  user_id     uuid    references auth.users(id) on delete cascade not null,
  icon        text    not null default '⭐',
  name        text    not null,
  goal        text    not null default '7일',
  created_at  timestamptz default now()
);

-- 2. 체크 기록 테이블 (날짜별)
create table if not exists habit_checks (
  id           uuid  default gen_random_uuid() primary key,
  habit_id     uuid  references habits(id) on delete cascade not null,
  user_id      uuid  references auth.users(id) on delete cascade not null,
  checked_date date  not null,
  created_at   timestamptz default now(),
  unique(habit_id, checked_date)
);

-- 3. Row Level Security 활성화
alter table habits       enable row level security;
alter table habit_checks enable row level security;

-- 4. 본인 데이터만 접근 가능
create policy "habits: own data only"
  on habits for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "habit_checks: own data only"
  on habit_checks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
