package p01.references;
/**
 * 배열-정렬(sort) 
 **/
public class ArrExample7 {
	public static void main(String[] args) {
		int[] num = {76,45,34,89,100,50,90,92};
		int temp = 0;
		//오름차순 정렬 시작
		for (int i = 0; i < num.length; i++) {
			for(int j = i+1; j<num.length; j++) {
				if (num[i] > num[j]) {  //i번째의 값이 i+1번째값보다 크면 서로 교체
					temp = num[i];
					num[i] = num[j];
					num[j] = temp;
				}
			}
		}
		//오름차순 정렬 끝
		System.out.print("{");
		for (int i = 0; i< num.length; i++) {
			System.out.print(num[i]+",");
		}System.out.println("}");
		System.out.println("===========================");
		//내림차순 정렬 시작
		for (int i = 0; i < num.length; i++) {
			for(int j = i+1; j<num.length; j++) {
				if (num[i] < num[j]) {  //i번째의 값이 i+1번째값보다 작으면 서로 교체
					temp = num[i];
					num[i] = num[j];
					num[j] = temp;
				}
			}
		}
		//내림차순 정렬 끝
		System.out.print("{");
		for (int i = 0; i< num.length; i++) {
			System.out.print(num[i]+",");
		}System.out.println("}");
	}
}
