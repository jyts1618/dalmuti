do $$
declare
  admin_password text := 'CHANGE_THIS_ADMIN_PASSWORD';
begin
  if admin_password = 'CHANGE_THIS_ADMIN_PASSWORD' then
    raise exception '관리자 삭제 비밀번호를 원하는 값으로 바꾼 뒤 실행하세요.';
  end if;

  insert into public.dalmuti_settings (key, value)
  values ('admin_delete_password_hash', crypt(admin_password, gen_salt('bf')))
  on conflict (key)
  do update set value = excluded.value;
end;
$$;
