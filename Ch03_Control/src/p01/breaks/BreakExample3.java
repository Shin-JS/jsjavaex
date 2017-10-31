package p01.breaks;
/**
 * 이중반복문을 빠져나가는 break;
 * 'Lable:' 을 선언 후 break Lable; 
 **/
public class BreakExample3 {
	public static void main(String[] args) {
		int i = 0;
		int j = 0;
	KK: while(true) {
			i++;
			while(true) {
				System.out.print("j="+j+"\t");
				if (j==5) {
					break KK; //라벨인 KK로 선언된 반복문을 벗어남=>바깥쪽 while이 끝남.
				}j++;
			}
			/*System.out.println("i=" + i);
			if(i==10) {
				break;
			}*/
		}
		System.out.println("종료");
			
	}
}
