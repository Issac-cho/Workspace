#include <iostream>
#include <vector>
#include <ctime>
#include "mcl/bls12_381.hpp"

#define n 4
#define m 3
#define N 16

using namespace std;
using namespace mcl::bn;
typedef struct{
    G1 _G[N*n];
    G1 _H[N*n];
    G1 _g, _h, _u;
    G1 _c[n];
    //int N; 전처리로 define 되어있다.
    Fr _x[n];
    Fr _r[n];
    int _x_int[n];
}input_of_pt1;
typedef struct{
    bool _test;
    G1 _G[N*n];
    G1 _H[N*n];
    G1 _h, _u, _P;
    Fr _t_hat;
    Fr _l[N*n], _r[N*n];
    Fr _mu;
} out_of_pt1;
typedef struct{
    bool _test;
    int _n;
    vector<G1> _G, _H;
    G1 _u, _P;
    vector<Fr> _l, _r;
} out_of_pt1_2;

bool Schnorr(Fr w, G1 g, G1 h) {
    // h = g*w

    Fr r;
    r.setByCSPRNG();

    G1 u = g*r;

    Fr c;
    c.setHashOf(u.getStr());

    Fr z = r+c*w;

    bool check;

    check=((g*z)==(u+h*c));

    return check;
}
out_of_pt1 Protocol_1(input_of_pt1 ip){
    
    //Prover's estimaiton
    Fr aL[n*N];
    for(int i=0; i<n; i++){
        int t = ip._x_int[i];
        for(int j=0; j<N; j++){
            aL[i*N+j] = t % 2;
            t = t / 2;
        }
    }

    Fr aR[n*N] = {0};
    for(int i=0; i<n*N; i++){
        aR[i] = aL[i] - 1;
    }
    
    Fr a_commit_randomness;
    a_commit_randomness.setByCSPRNG();
    G1 a_commitment;
    a_commitment = (ip._h) * a_commit_randomness;
    for(int i=0; i<N*n; i++){
        a_commitment += (ip._G)[i] * aL[i];
        a_commitment += (ip._H)[i] * aR[i];
    }

    //blinding term
    Fr sL[n*N];
    Fr sR[n*N];
    for(int i=0; i<n*N; i++){
        sL[i].setByCSPRNG();
        sR[i].setByCSPRNG();
    }
    Fr s_commit_randomness;
    s_commit_randomness.setByCSPRNG();
    G1 s_commitment;
    s_commitment = (ip._h) * s_commit_randomness;
    for(int i=0; i<N*n; i++){
        s_commitment += (ip._G)[i] * sL[i];
        s_commitment += (ip._H)[i] * sR[i];
    }

    // P->V : a_commitment, s_commitment
    // V's challenge
    Fr y_challenge, z_challenge;
    do{
        y_challenge.setByCSPRNG();
    }while(y_challenge == 0);
    do{
        z_challenge.setByCSPRNG();
    }while(z_challenge == 0);
    // V->P : y_challenge, z_challenge
    
    //Prover's estimation
        //최적화 필요할 수도...
    Fr t1 = 0, t2 = 0;
    Fr temp1, temp2, temp3, temp4[N];
    Fr y = 1, z = z_challenge * z_challenge, exp = 1;
    for(int i=0; i<N; i++){
        temp4[i] = exp;
        exp *= 2;
    }
    for(int i=0; i<N*n; i++){
        temp1 = aL[i] - z_challenge;
        temp2 = sR[i] * y;
        temp3 = (aR[i] + z_challenge) * y + z * temp4[i%N];
        y *= y_challenge;
        if(!((i+1)%N))
            z *= z_challenge;

        t1 += temp1 * temp2;
        t1 += sL[i] * temp3;
        t2 += sL[i] * temp2;
    }
    
    Fr t1_commit_randomness, t2_commit_randomness;
    t1_commit_randomness.setByCSPRNG();
    t2_commit_randomness.setByCSPRNG();
    G1 t1_commitment = (ip._g) * t1 + (ip._h) * t1_commit_randomness;
    G1 t2_commitment = (ip._g) * t2 + (ip._h) * t2_commit_randomness;

    //P->V : t1_commitment, t2_commitment
    //V's challenge
    Fr x_challenge;
    do{
        x_challenge.setByCSPRNG();
    }while(x_challenge == 0);
    Fr t_hat = 0;
    Fr l[N*n], r[N*n];
    y = 1, z = z_challenge * z_challenge;
    for(int i=0; i<N*n; i++){
        l[i] = aL[i] - z_challenge + (sL[i] * x_challenge);
        r[i] = y * (aR[i] + z_challenge + (sR[i] * x_challenge)) + (z * temp4[i%N]);
        t_hat += l[i] * r[i];
        y *= y_challenge;
        if(!((i+1)%N))
            z *= z_challenge;
    }
    Fr tau_x = t2_commit_randomness * x_challenge * x_challenge + (t1_commit_randomness * x_challenge);
    z = z_challenge * z_challenge;
    for(int i=0; i<n; i++){
        tau_x += z * ip._r[i];
        z *= z_challenge;
    }
    Fr mu = a_commit_randomness + (s_commit_randomness * x_challenge);
    
    //P->V : tau_x, mu, t_hat
    //P, V's estimation
    G1 H2[N*n];
    Fr yy = y_challenge;
    
    for(int i=0; i<N*n; i++){
        yy /= y_challenge;
        H2[i] = (ip._H)[i] * (-yy);
    }
    //V's estimation
    Fr delta = (z_challenge-(z_challenge*z_challenge))*(y-1)/(y_challenge-1);   //y = y_challenge ^ (N*n)
    Fr z1 = z_challenge*z_challenge*z_challenge;
    z = z1;
    for(int i=0; i<n; i++){
        z *= z_challenge;
    }
    delta -= (z - z1)/(z_challenge-1) * ((temp4[N-1]*2) - 1);
    G1 P = a_commitment + s_commitment*x_challenge;
    for(int i=0; i<n*N; i++){
        P += (ip._G)[i] * (-z_challenge);
    }
    y = 1;
    z = z_challenge;
    for(int i=0; i<N*n; i++){
        P += H2[i] * (z_challenge * y);
        y *= y_challenge;
        if(i%N == 0){ z *= z_challenge; }
        P += H2[i] * (temp4[i%N] * z);
    }
    
    G1 ch1 = (ip._g)*t_hat + (ip._h)*tau_x;
    Fr x_square = x_challenge*x_challenge;
    G1 ch2 = (ip._g)*delta + (t1_commitment*x_challenge) + (t2_commitment*x_square);
    z = z_challenge*z_challenge;
    for(int i=0; i<n; i++){
        ch2 += (ip._c)[i] * z;
        z *= z_challenge;
    }
    //end
    out_of_pt1 result;
    if(ch1 == ch2){
        result._test = true;
    }
    else{ result._test = false; }
    
    for(int i=0; i<N*n; i++){
        result._G[i] = (ip._G)[i];
        result._H[i] = H2[i];
        result._l[i] = l[i];
        result._r[i] = r[i];
    }
    result._P = P;
    result._h = ip._h;
    result._u = ip._u;
    result._t_hat = t_hat;
    result._mu = mu;

    return result;
}
bool _Protocol1_1(out_of_pt1 input){
    bool result;
    G1 ch = input._h*(input._mu);
    for(int i=0; i<N*n; i++){
        ch += input._G[i] * input._l[i];
        ch += input._H[i] * input._r[i];
    }
    result = (ch==input._P);
    return result;
}
bool _Protocol1_2(out_of_pt1 input){
    bool result;
    Fr ch = 0;
    for(int i=0; i<N*n; i++){
        ch += input._l[i] * input._r[i];
    }
    result = (ch == input._t_hat);
    return result;
}
out_of_pt1_2 Protocol1_1(out_of_pt1 input){

    G1 P_1 = (input._G)[0]*(input._l)[0]+(input._H)[0]*(input._r)[0]; // P'
    
    for(int i=1;i<N*n;i++){
        P_1 = P_1+(input._G)[i]*(input._l)[i]+(input._H)[i]*(input._r)[i];
    } // make P'
    
    bool check;

    check=((P_1)==((input._h)*(-(input._mu))+(input._P)));
    
    out_of_pt1_2 out;
    for(int i=0; i<N*n; i++){
        out._G.push_back((input._G)[i]);
        out._H.push_back((input._H)[i]);
        out._l.push_back((input._l)[i]);
        out._r.push_back((input._r)[i]);
    }
    if(check == false){
        out._test = false;
        out._n = N*n;
        out._u = input._u;
        out._P = P_1;
        return out;
    }
    cout<<"pt1_1"<<endl;
    Fr x; // x'
    do{
        x.setByCSPRNG();
    }while(x==0);
    //V->P : x
    G1 P_2 = P_1 + (input._u)*(x*(input._t_hat)); // make P''
    cout<<"pt1_1"<<endl;
    out._test = true;
    out._n = N*n;
    out._u = (input._u) * x;
    out._P = P_2;
    cout<<"pt1_1"<<endl;
    return out;
}
out_of_pt1_2 Protocol1_2(out_of_pt1_2 input, int* test){
    initPairing(mcl::BLS12_381);

    out_of_pt1_2 out;
    if(input._n == 1){
        Fr c = (input._l)[0] * (input._r)[0];
        if(input._P == (input._G)[0]*(input._l)[0] + (input._H)[0]*(input._r)[0] + (input._u)*c){
            *test *= 1;
        }
        else{ *test *= 0; }
        return out;
    }

    //P's estimation
    out._n = (input._n) / 2;
    Fr cL = 0, cR = 0;
    for(int i=0; i<out._n; i++){
        cL += (input._l)[i] * (input._r)[i+out._n];
        cR += (input._r)[i] * (input._l)[i+out._n];
    }
    G1 L = (input._u)*cL;
    G1 R = (input._u)*cR;
    for(int i=0; i<out._n; i++){
        L += (input._G)[i+out._n] * (input._l)[i] + (input._H)[i] * (input._r)[i+out._n];
        R += (input._G)[i] * (input._l)[i+out._n] + (input._H)[i+out._n] * (input._r)[i];
    }
    //P->V : L, R
    Fr x;
    do{
        x.setByCSPRNG();
    }while(x==0);
    Fr x_inv = 1/x;
    //V->P : x (challenge)
    //P,V's estimation
    (out._G).resize(out._n);
    (out._H).resize(out._n);
    for(int i=0; i<out._n; i++){
        (out._G)[i] = (input._G)[i] * x_inv + (input._G)[i+out._n] * x;
        (out._H)[i] = (input._H)[i] * x + (input._H)[i+out._n] * x_inv;
    }
    Fr x_inv2 = x_inv/x;
    out._P = L*(x*x) + input._P + R*x_inv2;
    //P's estimation
    (out._l).resize(out._n);
    (out._r).resize(out._n);
    for(int i=0; i<out._n; i++){
        (out._l)[i] = (input._l)[i] * x + (input._l)[i+out._n] * x_inv;
        (out._r)[i] = (input._r)[i] * x_inv + (input._r)[i+out._n] * x;
    }
    *test *= 1;
    return Protocol1_2(out, test);
}
bool Protocol2(const Fr b[], const vector<vector<Fr>> A, const G1 g, const G1 h, const G1 c[], const Fr r[], const Fr x[]){
    // //print
    // cout<<"b[m] :"<<endl;
    // for(int i=0; i<m; i++){
    //     cout<<b[i]<<" ";
    // }
    // cout<<endl;

    // cout<<"A[m][n] :"<<endl;
    // for(int i=0; i<m; i++){
    //     for(int j=0; j<n; j++){
    //         cout<<A[i][j]<<" ";
    //     }
    //     cout<<endl;
    // }

    //##########################################

    Fr p;
    p.setByCSPRNG(); // pick Rho
    Fr B=0; // Beta
    Fr a[n]; // Alpha
    for(int i=0; i<n; i++){ a[i] = 0; }

    Fr tmp[m];
    Fr tmp1 = 1;
    for(int i=0; i<m; i++){
        tmp[i] = tmp1;
        tmp1 *= p;
    }

    for(int i=0; i < m; i++){
        B = B + b[i] * tmp[i];
    } // Beta  

    for(int i=0; i<n; i++){
        for(int j=0; j<m; j++){
            a[i] += A[j][i] * tmp[j];
        }
    } // Alpha

    Fr w = 0; // witness

    for(int i =0; i<n; i++){
        w -= (r[i]*a[i]);
    } // make witness
    
    G1 l = g*B; // l s.t. l=h^w

    for(int i=0;i<n;i++){
        l = l - (c[i]*a[i]);
    } // make l s.t. l=h^w, verifier compute
    

    bool check = (l == h*w);

    bool schnorr = Schnorr(w, h, l);
    return schnorr;
}

int main(){
    // Check time
    clock_t start, finish;
    double duration;
 
    start = clock();

    //##############################################
    initPairing(mcl::BLS12_381);
    
    vector<vector<Fr>> A;
    Fr b[m];
    Fr x[n];
    int x_int[n];
    //---------------------------------------------
    //Hyperparameter
    A = {
        {1, 2, 3, 4},
        {5, 6, 7, 8},
        {9, 10, 11, 12}
    };
    b[0] = 300;
    b[1] = 700;
    b[2] = 1100;
    x_int[0] = 10;
    x_int[1] = 20;
    x_int[2] = 30;
    x_int[3] = 40;
    x[0] = x_int[0];
    x[1] = x_int[1];
    x[2] = x_int[2];
    x[3] = x_int[3];
    //---------------------------------------------
    //=============================================
    //Generate ( g,h,g,h,ci,N,u ; xk,r )
    //r
    Fr r[n];
    for(int i=0; i<n; i++){
        r[i].setByCSPRNG();
    }
    //double g, h
    G1 G[N*n];
    G1 H[N*n];
    string strg="gg", strh="hh";
    for(int i=0; i<N*n; i++){
        hashAndMapToG1(G[i],strg);
        hashAndMapToG1(H[i],strh);
        strg+="g";
        strh+="h";
    }
    //g, h, u
    G1 g, h, u;
    hashAndMapToG1(g,"g");
    hashAndMapToG1(h,"h");
    hashAndMapToG1(u,"u");
    //c : commiment of x, random value r
    G1 c[n];
    for(int i=0; i<n; i++){
        c[i] = g*x[i] + h*r[i];
    }
    //=============================================

    input_of_pt1 pt1_in;
    for(int i=0; i<N*n; i++){
        pt1_in._G[i] = G[i];
        pt1_in._H[i] = H[i];
    }
    pt1_in._g = g;
    pt1_in._h = h;
    pt1_in._u = u;
    for(int i=0; i<n; i++){
        pt1_in._c[i] = c[i];
        pt1_in._x[i] = x[i];
        pt1_in._x_int[i] = x_int[i];
        pt1_in._r[i] = r[i];
    }
    out_of_pt1 pt1_1_in;
    out_of_pt1_2 pt1_2_in, pt1_2_out;
    int a = 0;
    int* result = &a;
    start = clock();
    pt1_1_in = Protocol_1(pt1_in);
    // pt1_2_in = Protocol1_1(pt1_1_in);
    // pt1_2_out = Protocol1_2(pt1_2_in, result);
    bool pt2 = Protocol2(b, A, g, h, c, r, x);

    cout<<"Protocol_1__ : "<<pt1_1_in._test<<endl;
    cout<<"Protocol_1_1 : "<<_Protocol1_1(pt1_1_in)<<endl;
    cout<<"Protocol_1_2 : "<<_Protocol1_2(pt1_1_in)<<endl;
    cout<<"Protocol_2__ : "<<pt2<<endl;

    //#####################################################
    finish = clock();
 
    duration = (double)(finish - start) / CLOCKS_PER_SEC;
    cout << endl << duration << "초" << endl;

    return 0;
}