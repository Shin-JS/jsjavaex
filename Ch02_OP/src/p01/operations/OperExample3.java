package p01.operations;
/**
 * 증감연산자 - 증가or감소하는 연산자
 * 증감연산자는 피연산자의 왼쪽/오른쪽위치에 따라 증감되는 순서가 달라진다.
 * ex) ++x의 경우 먼저 1증가 후 연산
 *     x++인경우 연산 후 1증가
 **/
public class OperExample3 {
	public static void main(String[] args) {
		int x = 0 , y = 0;//초기값 x,y=0
		System.out.println(x++);  //0 출력후 1증가
		System.out.println(y++);
		System.out.println((x++)+(y++));  //x+y출력 후 각각 1씩 증가
		System.out.println((++x)+(++y));  //1씩 증가 후 x+y연산
		System.out.println(x-y);

		int family = 150;
		System.out.println("홍길동네 집에는 가족이" + ++family + "명 만큼있을리가있나......"); //151출력됨
		
	}
}
