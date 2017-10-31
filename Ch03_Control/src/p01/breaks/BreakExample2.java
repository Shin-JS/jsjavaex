package p01.breaks;
/**
 * break문 
 * break문 아래의 명령문은 실행하지 않고 반복블럭을 빠져나감
 **/
public class BreakExample2 {
	public static void main(String[] args) {
		int i = 0;
		int j = 0;
		while (true) {//바깥 while문 시작
			i++;
			while(true) {//안쪽 while문 시작
				System.out.print(j+"\t");
				if(j==5) {
					break;//break문을 만나면 아래의 j++명령을 실행하지 않고{}블럭을 빠져나감
				}j++;
			}//안쪽while문 끝
			System.out.println("i="+i);
			if(i==10) {
				break; //바깥쪽 반복문을 빠져나가는 break;
			}
		}//바깥 while문 종료
		System.out.println("종료");
	}
}
