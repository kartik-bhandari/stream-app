import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getUserFriends } from "../lib/api";
import NoFriendsFound from "../components/NoFriendsFound";
import FriendCard from "../components/FriendCard";
import { Link } from "react-router";
import { useEffect, useState } from "react";

const FriendsPage = () => {
  const queryClient = useQueryClient();

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });
  // console.log(friends)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto max-w-4xl space-y-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6">Your Friends</h1>

        {loadingFriends ? (
          <div className="flex justify-center py-12">
            <span className="loading loading-spinner loading-lg" />
          </div>
        ) : friends.length === 0 ? (
          <NoFriendsFound />
        ) : (
          <div className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {friends.map((friend) => (
            <div className="m-3">
              <FriendCard key={friend._id} friend={friend} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default FriendsPage;
