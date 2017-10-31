public class HelloTest{
 public static void main(String[] args){
  //주석: 프로그래의 목적, 용도, 제작시간등을 표시
  //한줄주석
  /*여러줄or 구간 주석
    위에서부터 바로 아래까지 주석
  */
  System.out.println(args/*주~~~석*/[0]+"님 반갑습니다");
  System.out.println(args[1]+"님 또한 반갑습니다");
   int x = 2; int y = 3; int result = x + y;
  System.out.println("결과: "+result);

  
  }
}