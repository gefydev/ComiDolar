import urllib.request as u, http.cookiejar, urllib.parse, re, subprocess
P='http://127.0.0.1:4472'
def filas(): return subprocess.run(['docker','exec','comi-pg-test','psql','-U','postgres','-d','donantes','-Atc','select count(*),sum(total) from donors'],capture_output=True,text=True).stdout.strip()
class NoRedir(u.HTTPRedirectHandler):
    def redirect_request(self,*a): return None
def abrir(op,url,data=None,headers={}):
    try:
        r=op.open(u.Request(url,data=urllib.parse.urlencode(data).encode() if data else None,headers=headers),timeout=10); return r.status,r.read().decode(),r.url
    except u.HTTPError as e: return e.code,e.read().decode(),e.headers.get('location','')
alta={'name':'Intruso','total':'1','year':'2026','csrf':'0'*64}
antes=filas(); print('filas antes',antes)
sin=u.build_opener(NoRedir)
s,_,loc=abrir(sin,P+'/'); print('sin sesión GET',s,loc[:50])
s,_,_=abrir(sin,P+'/alta',alta,{'origin':P}); print('1) sin sesión POST /alta',s)
s,_,_=abrir(sin,P+'/alta',alta,{'origin':P,'x-forwarded-user':'gefydev','authorization':'Basic Z2VmeWRldjpzZWNyZXRvcHJveHk='}); print('   sin sesión, cabeceras falsificadas',s)
def login(quien):
    u.urlopen('http://127.0.0.1:4473/quien?u='+quien).read()
    jar=http.cookiejar.CookieJar(); op=u.build_opener(u.HTTPCookieProcessor(jar))
    s,body,url=abrir(op,P+'/'); return op,jar,s,body
op,jar,s,body=login('otra-cuenta'); print('otra cuenta: login',s,'cookie de sesión:',any(c.name=='_oauth2_proxy' for c in jar))
s,_,_=abrir(op,P+'/alta',alta,{'origin':P}); print('2) otra cuenta POST /alta',s, '(403 = rechazado)')
print('filas después de los intentos',filas(),'igual' if filas()==antes else 'CAMBIÓ')
op,jar,s,body=login('gefydev'); tok=re.search(r'name="csrf" value="([0-9a-f]{64})"',body)
print('gefydev: login',s,'ve el panel:','Registrar donación' in body)
s,b,_=abrir(op,P+'/alta',{**alta,'name':'Prueba','csrf':tok[1]},{'origin':'https://otro.sitio'}); print('   gefydev, otro origen',s)
s,b,_=abrir(op,P+'/alta',{**alta,'name':'Prueba'},{'origin':P}); print('   gefydev, sin token CSRF válido',s)
s,b,_=abrir(op,P+'/alta',{**alta,'name':'Prueba','csrf':tok[1]},{'origin':P}); print('   gefydev alta',s,'registrada' if 'Donación registrada' in b else '','filas',filas())
