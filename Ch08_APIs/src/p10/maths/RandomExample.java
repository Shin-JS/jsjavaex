package p10.maths;

import java.util.Arrays;
import java.util.Random;

/**[API]
 *  -.Random클래스: Random(){}, Random(seed){}
 *  -.Random(seed){}: seed가 같으면 같은값 생성됨,(매개변수로 값을 넘겨주면 처음 생성된 무작위 난수가 고정됨, 다시 실행을 하여도 처음 발생한 
 *                                                 난수를 그대로 보여줌)
 **/
public class RandomExample {
	public static void main(String[] args) {
		//선택번호
		int[] selectNumber = new int[6]; //int타입의 배열
		Random random = new Random(5);
		System.out.println("선택번호:");
		for(int i = 0; i<6; i++) {
			selectNumber[i] = random.nextInt(45)+1; //1~45까지의 난수 발생
			System.out.print(selectNumber[i]+"  ");
		}
		System.out.println();
		//당첨번호(자동발번)
		int[] winNumber = new int[6];
		random = new Random(3);
		System.out.println("당첨번호:");
		for(int i = 0; i < 6 ; i++) {
			winNumber[i] = random.nextInt(45)+1;
			System.out.print(winNumber[i]+"  ");
		}
		System.out.println();
		//당첨여부 확인
		Arrays.sort(selectNumber);
		Arrays.sort(winNumber);
		//1차원 배열의 요소들의 값이 기본데이터 타입인경우(참조타입이 아님)의 비교
		boolean result = Arrays.equals(selectNumber,winNumber);
		System.out.println("당첨여부");
		if(result) {
			System.out.println("1등당첨");
		}else {
			System.out.println("인생이 다 그렇지 뭐");
		}
	}
}
