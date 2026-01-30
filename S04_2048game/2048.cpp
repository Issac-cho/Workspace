#include<iostream>
#include<cstdlib>   //for rand() and srand()
#include<ctime>     //for time()
#include<conio.h>
#include<windows.h>
#include<vector>
#include<string>
using namespace std;

void DrawMain();        // print Start screen
void DrawBoard();       // print Game screen
void DrawNumber_line1(int n);   // print n as 7 segment digit
void DrawNumber_line2(int n);
void DrawNumber_line3(int n);
void DrawNumber_line4(int n);
void DrawNumber_line5(int n);
void DrawNumber_line6(int n);
void DrawNumber_line7(int n);
void Add_Block();        // Randomly install 1 or 2 blocks in a blank
void HandleUserInput(); // enter a key

const int board_row = 4;
const int board_col = 4;
int game[board_row][board_col];

int main(){
    for(int i=0;i<board_row;i++){       //Initializing
        for(int j=0;j<board_col;j++)
            game[i][j] = 0;
    }
    Add_Block();
    //DrawMain(); // start screen
    while(1){
        HandleUserInput(); // processing user inputs

        // Add game logic (move block, check crash, remove row, update score etc..)
        // ...

        DrawBoard(); // draw game board
        Sleep(300);
    }
    return 0;
}

void DrawMain(){
    cout<<""<<endl;
    cout<<""<<endl;
    cout<<""<<endl;
    cout<<""<<endl;
    cout<<""<<endl;
}

void DrawBoard(){
    system("cls"); // Clear the console

    // To add: Up, down, left and right margins, border, status window, extend to 3x3
    // To add: Pause, output that running is in progress (engaged in Handling function case 'p')

    // Draw status window(title, score)
    // Draw game board
    for (int row = 0 ; row < board_row ; row++) {
        cout<<"           ";
        for(int col = 0 ; col<board_col ; col++){
            cout<<" ";
            DrawNumber_line1(game[row][col]);
        }
        cout<<endl<<"           ";
        for(int col = 0 ; col<board_col ; col++){
            cout<<" ";
            DrawNumber_line2(game[row][col]);
        }
        cout<<endl<<"           ";
        for(int col = 0 ; col<board_col ; col++){
            cout<<" ";
            DrawNumber_line3(game[row][col]);
        }
        cout<<endl<<"           ";
        for(int col = 0 ; col<board_col ; col++){
            cout<<" ";
            DrawNumber_line4(game[row][col]);
        }
        cout<<endl<<"           ";
        for(int col = 0 ; col<board_col ; col++){
            cout<<" ";
            DrawNumber_line5(game[row][col]);
        }
        cout<<endl<<"           ";
        for(int col = 0 ; col<board_col ; col++){
            cout<<" ";
            DrawNumber_line6(game[row][col]);
        }
        cout<<endl<<"           ";
        for(int col = 0 ; col<board_col ; col++){
            cout<<" ";
            DrawNumber_line7(game[row][col]);
        }
        cout<<endl<<endl;
    }
}

void DrawNumber_line1(int n){
    if(n==0) cout<<"             "; else
    if(n==1) cout<<"         ■■   "; else
    if(n==2) cout<<"    ■■■■■■    "; else
    if(n==3) cout<<"    ■■■■■■    "; else
    if(n==4) cout<<"   ■■     ■■   "; else
    if(n==5) cout<<"    ■■■■■■    "; else
    if(n==6) cout<<"    ■■■■■■    "; else
    if(n==7) cout<<"    ■■■■■■    "; else
    if(n==8) cout<<"    ■■■■■■    "; else
             cout<<"    ■■■■■■    ";
}
void DrawNumber_line2(int n){
    if(n==0) cout<<"             "; else
    if(n==1) cout<<"         ■■   "; else
    if(n==2) cout<<"         ■■   "; else
    if(n==3) cout<<"         ■■   "; else
    if(n==4) cout<<"   ■■     ■■   "; else
    if(n==5) cout<<"   ■■         "; else
    if(n==6) cout<<"   ■■         "; else
    if(n==7) cout<<"   ■■     ■■   "; else
    if(n==8) cout<<"   ■■     ■■   "; else
             cout<<"   ■■     ■■   ";
}
void DrawNumber_line3(int n){
    if(n==0) cout<<"             "; else
    if(n==1) cout<<"         ■■   "; else
    if(n==2) cout<<"         ■■   "; else
    if(n==3) cout<<"         ■■   "; else
    if(n==4) cout<<"   ■■     ■■   "; else
    if(n==5) cout<<"   ■■         "; else
    if(n==6) cout<<"   ■■         "; else
    if(n==7) cout<<"   ■■     ■■   "; else
    if(n==8) cout<<"   ■■     ■■   "; else
             cout<<"   ■■     ■■   ";
}
void DrawNumber_line4(int n){
    if(n==0) cout<<"             "; else
    if(n==1) cout<<"         ■■   "; else
    if(n==2) cout<<"    ■■■■■■    "; else
    if(n==3) cout<<"    ■■■■■■    "; else
    if(n==4) cout<<"    ■■■■■■■   "; else
    if(n==5) cout<<"    ■■■■■■    "; else
    if(n==6) cout<<"    ■■■■■■    "; else
    if(n==7) cout<<"   ■■     ■■   "; else
    if(n==8) cout<<"    ■■■■■■    "; else
             cout<<"    ■■■■■■    ";
}
void DrawNumber_line5(int n){
    if(n==0) cout<<"             "; else
    if(n==1) cout<<"         ■■   "; else
    if(n==2) cout<<"   ■■         "; else
    if(n==3) cout<<"         ■■   "; else
    if(n==4) cout<<"         ■■   "; else
    if(n==5) cout<<"         ■■   "; else
    if(n==6) cout<<"   ■■     ■■   "; else
    if(n==7) cout<<"         ■■   "; else
    if(n==8) cout<<"   ■■     ■■   "; else
             cout<<"         ■■   ";
}
void DrawNumber_line6(int n){
    if(n==0) cout<<"             "; else
    if(n==1) cout<<"         ■■   "; else
    if(n==2) cout<<"   ■■         "; else
    if(n==3) cout<<"         ■■   "; else
    if(n==4) cout<<"         ■■   "; else
    if(n==5) cout<<"         ■■   "; else
    if(n==6) cout<<"   ■■     ■■   "; else
    if(n==7) cout<<"         ■■   "; else
    if(n==8) cout<<"   ■■     ■■   "; else
             cout<<"         ■■   ";
}
void DrawNumber_line7(int n){
    if(n==0) cout<<"             "; else
    if(n==1) cout<<"         ■■   "; else
    if(n==2) cout<<"    ■■■■■■    "; else
    if(n==3) cout<<"    ■■■■■■    "; else
    if(n==4) cout<<"         ■■   "; else
    if(n==5) cout<<"    ■■■■■■    "; else
    if(n==6) cout<<"    ■■■■■■    "; else
    if(n==7) cout<<"         ■■   "; else
    if(n==8) cout<<"    ■■■■■■    "; else
             cout<<"    ■■■■■■    ";
}
void Add_Block(){   // Randomly install 1 or 2 blocks in a blank
    int row, col;
    while(1){
        srand(static_cast<unsigned int>(time(NULL)));   // Select row randomly
        row = rand() % 4;
        vector<int> cnt;
        for(int i=0 ; i<board_col ; i++){
            if(game[row][i] == 0)
                cnt.push_back(i);
        }
        if(cnt.size()==0)   // try again if the row is full
            continue;
        srand(static_cast<unsigned int>(time(NULL)));   // Select blank randomly
        col = cnt[rand() % cnt.size()];
        break;
    }
    srand(static_cast<unsigned int>(time(NULL)));   // Select 1 or 2 (block number)
    int val = rand() % 2 + 1;
    game[row][col] = val;
}

void HandleUserInput(){
    if (_kbhit()) { // When a keyboard input is detected
        char key = _getch(); // Read key value

        switch (key) {
            case 'a': {
                // Add left-hand movement logic

                // 1. Press a to activate
                // 2. All blocks are closed to the left
                // 3. PASS where there is zero
                // 4. Non-zero digits move to the right of the wall or a number that is not zero and is not itself
                // 5. When you meet a block like yourself, it merges and the value of the block +1

                // wall 1 0 0 0 -- No change
                // wall 0 1 0 0 -- place first and second
                // wall 0 0 1 0 -- place first and third
                // wall 0 0 0 1 -- place first and fourth
                // wall 1 1 0 0 -- first = 2, second = 0
                // wall 1 0 1 0 -- first = 2, third = 0
                // wall 1 0 0 1 -- first = 2, fourth = 0

                // Remove all zeros from the nth row
                // 1. If the same number is attached, remove the two and +1 and insert one
                // 2. Fill the remaining right with zero.

                bool testa = false;
                for(int i=0 ; i<board_row ; i++){
                    bool testi = false;
                    int pre[board_col] = {0};
                    for(int t=0, t1=0 ; t<board_col ; t++){ // Close nonzero spaces to the left, reset game[i] to zero
                        if(game[i][t] != 0){
                            pre[t1] = game[i][t];
                            if(t1<t)
                                testi = true;
                            t1++;
                        }
                        game[i][t] = 0;
                    }
                    for(int t=0 ; t<board_col-1 ; t++){     // If the same type of block is attached, put +1 on the left and 0 on the right
                        if(pre[t] == pre[t+1] && pre[t] != 0){
                            pre[t+1] = 0;
                            pre[t]++;
                            testi = true;
                        }
                    }
                    for(int t=0, t1=0 ; t<board_col ; t++){ // Close to the left and enter game[i]
                        if(pre[t] != 0){
                            game[i][t1] = pre[t];
                            t1++;
                        }
                    }
                    testa = testa | testi;
                }
                if(testa)
                    Add_Block();
                break;
            }
            case 'd': {
                // Add right-hand movement logic
                bool testd = false;
                for(int i=0 ; i<board_row ; i++){
                    bool testi = false;
                    int pre[board_col] = {0};
                    for(int t=board_col-1, t1=board_col-1 ; t>=0 ; t--){ // Close nonzero spaces to the right, reset game[i] to zero
                        if(game[i][t] != 0){
                            pre[t1] = game[i][t];
                            if(t1>t)
                                testi = true;
                            t1--;
                        }
                        game[i][t] = 0;
                    }
                    for(int t=board_col-1 ; t>0 ; t--){     // If the same type of block is attached, put +1 on the right and 0 on the left
                        if(pre[t] == pre[t-1] && pre[t] != 0){
                            pre[t-1] = 0;
                            pre[t]++;
                            testi = true;
                        }
                    }
                    for(int t=board_col-1, t1=board_col-1 ; t>=0 ; t--){ // Close to the right and enter game[i]
                        if(pre[t] != 0){
                            game[i][t1] = pre[t];
                            t1--;
                        }
                    }
                    testd = testd | testi;
                }
            
                if(testd)
                    Add_Block();
                break;
            }
            case 'w': {
                // Add up movement logic
                bool testw = false;
                for(int i=0 ; i<board_col ; i++){
                    bool testi = false;
                    int pre[board_row] = {0};
                    for(int t=0, t1=0 ; t<board_row ; t++){ // Close nonzero spaces upward, reset game[][i] to zero
                        if(game[t][i] != 0){
                            pre[t1] = game[t][i];
                            if(t1<t)
                                testi = true;
                            t1++;
                        }
                        game[t][i] = 0;
                    }
                    for(int t=0 ; t<board_row-1 ; t++){     // If the same type of block is attached, do +1 on the top and 0 on the bottom
                        if(pre[t] == pre[t+1] && pre[t] != 0){
                            pre[t+1] = 0;
                            pre[t]++;
                            testi = true;
                        }
                    }
                    for(int t=0, t1=0 ; t<board_row ; t++){ // Close to the top and substitute in game[][i]
                        if(pre[t] != 0){
                            game[t1][i] = pre[t];
                            t1++;
                        }
                    }
                    testw = testw | testi;
                }
                if(testw)
                    Add_Block();
                break;
            }
            case 's': {
                // Add down movement logic
                bool tests = false;
                for(int i=0 ; i<board_col ; i++){
                    bool testi = false;
                    int pre[board_row] = {0};
                    for(int t=board_row-1, t1=board_row-1 ; t>=0 ; t--){ // Close nonzero spaces downward, reset game[][i] to zero
                        if(game[t][i] != 0){
                            pre[t1] = game[t][i];
                            if(t1>t)
                                testi = true;
                            t1--;
                        }
                        game[t][i] = 0;
                    }
                    for(int t=board_row-1 ; t>0 ; t--){     // If the same type of block is attached, do +1 on the bottom and 0 on the top
                        if(pre[t] == pre[t-1] && pre[t] != 0){
                            pre[t-1] = 0;
                            pre[t]++;
                            testi = true;
                        }
                    }
                    for(int t=board_row-1, t1=board_row-1 ; t>=0 ; t--){ // Close to the bottom and substitute in game[][i]
                        if(pre[t] != 0){
                            game[t1][i] = pre[t];
                            t1--;
                        }
                    }
                    tests = tests | testi;
                }
                if(tests)
                    Add_Block();
                break;
            }
            case 'p': {
                // Pause on/off
                while(1){
                    if (_kbhit()){
                        char key = _getch();
                        if(key == 'p')
                            break;
                    }
                }
            }
            // other key
        }
    }
}
