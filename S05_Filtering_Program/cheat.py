basket = open('first.txt','r',encoding='utf-8')
data_str = basket.read()
basket.close()

data1 = []
for line in data_str.split("\n"):
    row = [x for x in line.split("\t")]
    data1.append(row)

basket = open('second.txt','r',encoding='utf-8')
data_str = basket.read()
basket.close()

data2 = []
for line in data_str.split("\n"):
    row = [x for x in line.split("\t")]
    data2.append(row)

basket = open('check10.txt','r',encoding='utf-8')
data_str = basket.read()
basket.close()

wtcheck = []
for line in data_str.split("\n"):
    wtcheck.append(line)

#============================================================

for ch in wtcheck:
    if '=' in ch:
        print(ch)
        continue
    W=True
    for d1 in data1:
        if ch in d1[1]:
            print(ch,"\t\t",d1[0],"\t\t",d1[1])
            W=False
    for d2 in data2:
        if ch in d2[1]:
            print(ch,"\t\t",d2[0],"\t\t",d2[1])
            W=False
    if W:
        print(ch,"\t\t","n/a")
