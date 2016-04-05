#coding=utf-8
import pymysql
import sys
import os

if len(sys.argv) >=4:
    dirname = sys.argv[1]
    if dirname[-1] == '/':
        dirname = dirname[0:-1];
    appid = int(sys.argv[2])
    mainpage = sys.argv[3]
else:
    print("missing args!");
    print("ex: importdb.py dirname appid index.html");
    exit();
try:
    conn=conn = pymysql.connect(host='192.168.99.184',user='root',passwd='12345',db='ice_db',port=3306)
    cur=conn.cursor()

    sql = 'insert into apps_t values(%s, %s, %s, %s, %s)';
    cur.execute(sql, (appid, "", "*", "/appid_"+str(appid)+ "/" + mainpage, ""));
    for r in cur.fetchall():
        print(r);

    sql = 'insert into res_t values(%s, %s, %s, %s)';
    for root, dirs, files in os.walk(dirname):
        for file in files:
            filename = os.path.join(root,file);
            url = filename.replace(dirname, "", 1);
            type = os.path.splitext(filename)[1][1:];
            print(url, type);

            ff = open(filename,"rb").read();
            #cur.execute('select * from res_t')
            cur.execute(sql, (url, type, appid, pymysql.Binary(ff)));
            for r in cur.fetchall():
                print(r);

    cur.close()
    conn.commit();
    conn.close()
except pymysql.Error as e:
    print("Err %d: %s" %(e.args[0], e.args[1]))
