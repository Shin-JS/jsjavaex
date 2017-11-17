package p06.treeset;

import java.util.TreeSet;

/**[2진트리]
 * -.TreeSet: binary tree 구조 형태로 객체를 저장하는 자료구조, 저장시 순서가 정해짐(기본: 오름차순)
 **/
public class TreeSetExample {
	public static void main(String[] args) {
		//TreeSet객체 생성
		TreeSet<Integer> scores = new TreeSet<>();
		//저장 -add()
		scores.add(new Integer(87));
		scores.add(98); //auto-boxing
		scores.add(new Integer(75));
		scores.add(new Integer(95));
		scores.add(80); //auto-boxing
		
		Integer score = null;
		score = scores.first(); //정렬되어 저장되어있는 객체들 중 가장 작은값의 객체
		System.out.println("가장 낮은 점수: "+score);
		score = scores.last(); //정렬되어 저장되어있는 객체들 중 가장 큰값의 객체
		System.out.println("가장 높은 점수: "+score);
		score = scores.lower(95); //해당 객체 바로 앞의 객체(바로 아랫값을 가져오는듯)
		System.out.println("95점 아래 점수: "+score);
		score = scores.higher(95);//해당객체 바로 위의 객체
		System.out.println("95점 위의 점수: "+score);
		score = scores.floor(new Integer(95));//해당객체와 가장 근사치의 객체(매개변수로 들어간 값 혹은 그 아랫값) 
		System.out.println("95점이거나 바로 아래점수: "+score);
		score = scores.ceiling(new Integer(85));//해당객체와 가장 근사치의 객체(매개변수로 들어간 값 혹은 그 위의값)
		System.out.println("85점이거나 바로 위 점수: "+score);
		
		while(!scores.isEmpty()) { //자료가 비어있는지 여부 확인: isEmpty()
			score = scores.pollFirst(); //가장 작은값을 추출하는 메소드(앞에있는값부터 하나씩 뺌)
			System.out.println(score+ ", 남은 객체 수: " + scores.size());
		}
		
		
	}
}
