package p08.arrays;

import java.util.Arrays;

/**[API]
 *  -.Sort: Sort는 기본적으로 오름차순
 **/
public class SortExample {
	public static void main(String[] args) {
		//기본데이터 타입
		int[] scores = {99,97,98};
		Arrays.sort(scores); //기본데이터 타입은 오름차순으로 정렬됨
		for(int i = 0; i<scores.length;i++) {
			System.out.println(scores[i]);
		}
		//String 타입인 경우
		String[] names = {"홍길동","박동수","김민수"};
		Arrays.sort(names);
		for(int i =0;i<names.length;i++) {
			System.out.println(names[i]);
		}
		//객체타입(여기서는 Member로 테스트)
		Member m1 = new Member("홍길동");
		Member m2 = new Member("홍길이");
		Member m3 = new Member("홍길당");
		Member[] members = {m1,m2,m3};
		Arrays.sort(members);
		for(int i = 0; i  < members.length; i++) {
			System.out.println(members[i].name);
		}
	}
}
